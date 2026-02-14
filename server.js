const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// Models imported dynamically based on DB connection
const PORT = process.env.PORT || 3005;

// MongoDB Connection with Fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

let User, Quiz, Result;

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
    .then(() => {
        console.log('✅ MongoDB Bağlantısı Başarılı!');
        User = require('./models/User');
        Quiz = require('./models/Quiz');
        Result = require('./models/Result');
    })
    .catch(err => {
        console.log('⚠️ MongoDB Bağlanamadı, Yerel Dosya Moduna Geçiliyor...');
        console.log('Hata:', err.message);

        // Import factory
        const createModel = require('./models/LocalDB');

        // Create models using factory
        User = createModel('User');
        Quiz = createModel('Quiz');
        Result = createModel('Result');
    });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' })); // Limit request size
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public'));

// Simple rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
        const data = requestCounts.get(ip);
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + RATE_LIMIT_WINDOW;
        } else {
            data.count++;
            if (data.count > MAX_REQUESTS) {
                return res.status(429).json({ success: false, message: 'Çok fazla istek. Lütfen bekleyin.' });
            }
        }
    }
    
    next();
});

// Clean up old rate limit data every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 300000);

// ==================== AUTH ROUTES ====================

// User Login (for quiz participants)
app.post('/api/user/login', async (req, res) => {
    try {
        console.log('📥 User login request:', req.body);
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name) {
            console.log('❌ Missing first_name or last_name');
            return res.status(400).json({ success: false, message: 'İsim ve soyisim gerekli' });
        }

        // Find or create user
        let user = await User.findOne({ first_name, last_name });
        console.log('🔍 User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('➕ Creating new user...');
            user = new User({
                first_name,
                last_name,
                username: `${first_name.toLowerCase()}_${last_name.toLowerCase()}`,
                password: await bcrypt.hash('default', 10), // Default password
                total_points: 0,
                questions_answered: 0,
                correct_answers: 0
            });
            await user.save();
            console.log('✅ User created:', user._id);
        }

        res.json({ success: true, user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            total_points: user.total_points
        }});
        console.log('✅ Login successful');
    } catch (error) {
        console.error('❌ User login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Default admin credentials
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'admin123';

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            res.json({ success: true, message: 'Admin girişi başarılı' });
        } else {
            res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, username, password } = req.body;
        
        // Input validation
        if (!first_name || !last_name || !username || !password) {
            return res.status(400).json({ success: false, message: 'Tüm alanlar gerekli' });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ success: false, message: 'Kullanıcı adı 3-30 karakter olmalı' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalı' });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ success: false, message: 'Kullanıcı adı sadece harf, rakam ve _ içerebilir' });
        }
        
        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ 
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            username: username.trim(), 
            password: hashedPassword,
            total_points: 0,
            questions_answered: 0,
            correct_answers: 0
        });
        await user.save();

        res.status(201).json({ success: true, message: 'Kullanıcı oluşturuldu' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Kayıt sırasında hata oluştu' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ success: false, message: 'Şifre yanlış' });

        res.json({ success: true, user: {
            id: user._id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
        }});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== CREATOR ROUTES ====================

// Get user's quizzes
app.get('/api/creator/:userId/quizzes', async (req, res) => {
    try {
        // Input validation
        if (!req.params.userId || req.params.userId.length < 3) {
            return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
        }

        const quizzes = await Quiz.find({ creator_id: req.params.userId });
        
        // Add counts
        const quizzesWithCounts = await Promise.all(quizzes.map(async (quiz) => {
            const participantCount = await Result.find({ quiz_code: quiz.quiz_code }).then(results => {
                const uniqueParticipants = new Set(results.map(r => r.participant_name));
                return uniqueParticipants.size;
            });
            
            return {
                ...quiz.toObject ? quiz.toObject() : quiz,
                question_count: quiz.questions ? quiz.questions.length : 0,
                participant_count: participantCount
            };
        }));
        
        res.json(quizzesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new quiz
app.post('/api/creator/quizzes', async (req, res) => {
    try {
        const { creator_id, title, description } = req.body;

        // Input validation
        if (!creator_id || !title) {
            return res.status(400).json({ success: false, message: 'Creator ID ve başlık gerekli' });
        }

        if (title.length > 200) {
            return res.status(400).json({ success: false, message: 'Başlık çok uzun (max 200 karakter)' });
        }

        if (description && description.length > 500) {
            return res.status(400).json({ success: false, message: 'Açıklama çok uzun (max 500 karakter)' });
        }

        // Generate unique 6-char code
        let quizCode;
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            quizCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await Quiz.findOne({ quiz_code: quizCode });
            if (!existing) isUnique = true;
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({ success: false, message: 'Quiz kodu oluşturulamadı' });
        }

        const quiz = new Quiz({
            quiz_code: quizCode,
            creator_id,
            title,
            description,
            questions: [],
            is_active: true
        });

        await quiz.save();
        
        // Return clean object
        const cleanQuiz = {
            quiz_code: quiz.quiz_code,
            creator_id: quiz.creator_id,
            title: quiz.title,
            description: quiz.description,
            is_active: quiz.is_active,
            _id: quiz._id
        };
        
        res.status(201).json({ success: true, quiz: cleanQuiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get quiz by code (for creator)
app.get('/api/creator/quiz/:code', async (req, res) => {
    try {
        // Input validation
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Geçersiz quiz kodu' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });
        }
        res.json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get quiz questions
app.get('/api/creator/quiz/:code/questions', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ message: 'Geçersiz quiz kodu' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz bulunamadı' });
        }
        res.json(quiz.questions || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add question to quiz
app.post('/api/creator/quiz/:code/questions', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Geçersiz quiz kodu' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });
        }

        const { question_text, option_a, option_b, option_c, option_d, correct_answer, points } = req.body;
        
        // Input validation
        if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
            return res.status(400).json({ success: false, message: 'Tüm alanlar gerekli' });
        }

        if (question_text.length > 500) {
            return res.status(400).json({ success: false, message: 'Soru metni çok uzun (max 500 karakter)' });
        }

        if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
            return res.status(400).json({ success: false, message: 'Geçersiz doğru cevap' });
        }

        if (points < 1 || points > 100) {
            return res.status(400).json({ success: false, message: 'Puan 1-100 arasında olmalı' });
        }

        if (!quiz.questions) quiz.questions = [];
        
        // Limit number of questions
        if (quiz.questions.length >= 50) {
            return res.status(400).json({ success: false, message: 'Maksimum 50 soru eklenebilir' });
        }
        
        quiz.questions.push({
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points: parseInt(points)
        });
        
        await quiz.save();
        res.json({ success: true, quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete question from quiz
app.delete('/api/creator/quiz/:code/questions/:questionId', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Geçersiz quiz kodu' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });
        }

        quiz.questions = quiz.questions.filter(q => q._id.toString() !== req.params.questionId);
        await quiz.save();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get quiz participants
app.get('/api/creator/quiz/:code/participants', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ message: 'Geçersiz quiz kodu' });
        }

        const results = await Result.find({ quiz_code: code }).sort({ completed_at: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get quiz leaderboard
app.get('/api/creator/quiz/:code/leaderboard', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ message: 'Geçersiz quiz kodu' });
        }

        const results = await Result.find({ quiz_code: code }).sort({ score: -1 }).limit(10);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user participations
app.get('/api/user/:userId/participations', async (req, res) => {
    try {
        // This would need to track user participations - for now return empty
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== PUBLIC ROUTES (Participants) ====================

// Get Quiz by Code
app.get('/api/public/quiz/:code', async (req, res) => {
    try {
        const code = req.params.code.toUpperCase();
        
        // Input validation
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Geçersiz quiz kodu formatı' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code, is_active: true });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı veya aktif değil' });

        // Remove correct answers from response
        const publicQuiz = {
            quiz_code: quiz.quiz_code,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(q => ({
                _id: q._id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
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
        const code = req.params.code.toUpperCase();
        
        // Input validation
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'Geçersiz quiz kodu formatı' });
        }

        const { participant_name, answers } = req.body;
        
        // Validate participant name
        if (!participant_name || participant_name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Geçerli bir isim girin' });
        }

        if (participant_name.length > 100) {
            return res.status(400).json({ success: false, message: 'İsim çok uzun (max 100 karakter)' });
        }

        // Validate answers
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Geçersiz cevap formatı' });
        }

        const quiz = await Quiz.findOne({ quiz_code: code });

        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz bulunamadı' });

        let score = 0;
        let max_score = 0;
        let correct_count = 0;
        const resultAnswers = [];

        quiz.questions.forEach(q => {
            const userAnswer = answers.find(a => a.question_id === q._id.toString());
            const isCorrect = userAnswer && userAnswer.answer === q.correct_answer;

            if (isCorrect) {
                score += q.points;
                correct_count++;
            }
            max_score += q.points;

            resultAnswers.push({
                question_id: q._id.toString(),
                answer: userAnswer ? userAnswer.answer : null,
                is_correct: isCorrect,
                points_earned: isCorrect ? q.points : 0
            });
        });

        const result = new Result({
            quiz_code: quiz.quiz_code,
            participant_name: participant_name.trim(),
            score,
            max_score,
            correct_answers: correct_count,
            total_questions: quiz.questions.length,
            answers: resultAnswers
        });

        await result.save();

        res.json({
            success: true,
            score,
            max_score,
            correct_count,
            wrong_count: quiz.questions.length - correct_count
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
