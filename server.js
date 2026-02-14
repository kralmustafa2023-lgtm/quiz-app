const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { database, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Veritabanını başlat
initDatabase();

// ==================== ADMIN ROUTES ====================

// Admin giriş kontrolü
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = database.findAdmin(username, password);

    if (admin) {
        res.json({ success: true, message: 'Giriş başarılı!' });
    } else {
        res.json({ success: false, message: 'Kullanıcı adı veya şifre hatalı!' });
    }
});

// Soru ekleme
app.post('/api/admin/questions', (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, points } = req.body;

    try {
        const question = database.createQuestion({
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points: parseInt(points) || 10
        });

        res.json({ success: true, questionId: question.id });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Tüm soruları getir
app.get('/api/admin/questions', (req, res) => {
    const questions = database.getAllQuestions();
    res.json(questions.reverse()); // En yeni sorular en üstte
});

// Soru silme
app.delete('/api/admin/questions/:id', (req, res) => {
    const { id } = req.params;
    try {
        database.deleteQuestion(id);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Tüm kullanıcıları ve puanlarını getir
app.get('/api/admin/users', (req, res) => {
    const users = database.getAllUsersWithStats();
    res.json(users);
});

// Sıralama tablosu (Leaderboard)
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = database.getLeaderboard(10);
    res.json(leaderboard);
});

// ==================== USER ROUTES ====================

// Kullanıcı kaydı/girişi
app.post('/api/user/login', (req, res) => {
    const { first_name, last_name } = req.body;

    // Kullanıcıyı kontrol et
    let user = database.findUser(first_name, last_name);

    if (!user) {
        // Yeni kullanıcı oluştur
        user = database.createUser(first_name, last_name);
    }

    res.json({ success: true, user });
});

// Test için soruları getir
app.get('/api/questions', (req, res) => {
    const questions = database.getAllQuestions().map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        points: q.points
    }));
    res.json(questions);
});

// Test cevabını kaydet
app.post('/api/submit-answer', (req, res) => {
    const { user_id, question_id, user_answer } = req.body;

    // Doğru cevabı kontrol et
    const question = database.getQuestion(question_id);

    if (!question) {
        return res.json({ success: false, message: 'Soru bulunamadı!' });
    }

    const is_correct = user_answer === question.correct_answer;
    const points_earned = is_correct ? question.points : 0;

    // Cevabı kaydet
    database.saveTestResult(user_id, question_id, user_answer, is_correct, points_earned);

    res.json({
        success: true,
        is_correct,
        points_earned,
        correct_answer: question.correct_answer
    });
});

// Kullanıcının test sonuçlarını getir
app.get('/api/user/:userId/results', (req, res) => {
    const { userId } = req.params;
    const results = database.getUserResults(userId);
    res.json(results);
});

// Sunucuyu başlat
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Quiz Uygulaması çalışıyor!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin Giriş: admin / admin123\n`);
});
