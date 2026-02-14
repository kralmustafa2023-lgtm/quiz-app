const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

// Models
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_123';

// MongoDB Connection
// Kullanıcı bağlantı stringi vermezse local fallback veya uyarı logu
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Bağlantısı Başarılı!'))
    .catch(err => console.error('❌ MongoDB Bağlantı Hatası:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ success: true, message: 'Kullanıcı oluşturuldu' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Kullanıcı adı kullanımda olabilir' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ success: false, message: 'Şifre yanlış' });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
        res.json({ success: true, token, username: user.username });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== CREATOR ROUTES (Protected) ====================

// Get my quizzes
app.get('/api/creator/quizzes', authenticateToken, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ creator: req.user.id }).sort({ created_at: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new quiz
app.post('/api/creator/quizzes', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;

        // Generate unique 6-char ID
        let uniqueId;
        let isUnique = false;
        while (!isUnique) {
            uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await Quiz.findOne({ id: uniqueId });
            if (!existing) isUnique = true;
        }

        const quiz = new Quiz({
            id: uniqueId,
            creator: req.user.id,
            title,
            description
        });

        await quiz.save();
        res.status(201).json({ success: true, quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Add questions to quiz
app.post('/api/creator/quizzes/:id/questions', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id, creator: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });

        const { text, options, correct_answer, points } = req.body;
        quiz.questions.push({ text, options, correct_answer, points });
        await quiz.save();

        res.json({ success: true, quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get quiz results (for creator)
app.get('/api/creator/quizzes/:id/results', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.id, creator: req.user.id });
        if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı' });

        const results = await Result.find({ quiz_id: quiz._id }).sort({ score: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete quiz
app.delete('/api/creator/quizzes/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ id: req.params.id, creator: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });

        // Clean up results
        await Result.deleteMany({ quiz_id: quiz._id });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== PUBLIC ROUTES (Students) ====================

// Get Quiz by Code
app.get('/api/public/quiz/:code', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.code, is_active: true });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı veya aktif değil' });

        // Remove correct answers from response
        const publicQuiz = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(q => ({
                _id: q._id,
                text: q.text,
                options: q.options,
                points: q.points
            }))
        };

        res.json({ success: true, quiz: publicQuiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Submit Quiz
app.post('/api/public/quiz/:code/submit', async (req, res) => {
    try {
        const { user_name, answers } = req.body;
        const quiz = await Quiz.findOne({ id: req.params.code });

        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });

        let score = 0;
        let max_score = 0;
        const resultAnswers = [];

        quiz.questions.forEach(q => {
            const userAnswer = answers.find(a => a.question_id === q._id.toString());
            const isCorrect = userAnswer && userAnswer.value === q.correct_answer;

            if (isCorrect) score += q.points;
            max_score += q.points;

            resultAnswers.push({
                question_id: q._id,
                given_answer: userAnswer ? userAnswer.value : null,
                correct_answer: q.correct_answer,
                is_correct: isCorrect
            });
        });

        const result = new Result({
            quiz_id: quiz._id,
            user_name,
            score,
            max_score,
            answers: resultAnswers
        });

        await result.save();

        res.json({
            success: true,
            score,
            max_score,
            results: resultAnswers // Optional: show correct answers immediately
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📝 Local: http://localhost:${PORT}`);
    if (!process.env.MONGODB_URI) {
        console.log(`⚠️  UYARI: MongoDB URI tanımlı değil. 'mongodb://localhost:27017/quiz-app' deneniyor.`);
    }
});
