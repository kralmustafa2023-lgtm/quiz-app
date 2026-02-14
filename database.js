const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'quiz-data.json');

// Varsayılan veritabanı yapısı
const defaultDB = {
    admins: [
        { id: 1, username: 'admin', password: 'admin123' }
    ],
    users: [],
    questions: [],
    test_results: []
};

// Veritabanını yükle veya oluştur
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
        return defaultDB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Veritabanını kaydet
function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = loadDB();

// Helper fonksiyonlar
const database = {
    // Admin
    findAdmin: (username, password) => {
        return db.admins.find(a => a.username === username && a.password === password);
    },

    // Users
    findUser: (firstName, lastName) => {
        return db.users.find(u => u.first_name === firstName && u.last_name === lastName);
    },

    createUser: (firstName, lastName) => {
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB(db);
        return newUser;
    },

    // Questions
    getAllQuestions: () => {
        return db.questions;
    },

    createQuestion: (questionData) => {
        const newQuestion = {
            id: db.questions.length > 0 ? Math.max(...db.questions.map(q => q.id)) + 1 : 1,
            question_text: questionData.question_text,
            option_a: questionData.option_a,
            option_b: questionData.option_b,
            option_c: questionData.option_c,
            option_d: questionData.option_d,
            correct_answer: questionData.correct_answer,
            points: questionData.points || 10,
            created_at: new Date().toISOString()
        };
        db.questions.push(newQuestion);
        saveDB(db);
        return newQuestion;
    },

    deleteQuestion: (id) => {
        db.questions = db.questions.filter(q => q.id !== parseInt(id));
        saveDB(db);
    },

    getQuestion: (id) => {
        return db.questions.find(q => q.id === parseInt(id));
    },

    // Test Results
    saveTestResult: (userId, questionId, userAnswer, isCorrect, pointsEarned) => {
        const result = {
            id: db.test_results.length > 0 ? Math.max(...db.test_results.map(r => r.id)) + 1 : 1,
            user_id: userId,
            question_id: questionId,
            user_answer: userAnswer,
            is_correct: isCorrect ? 1 : 0,
            points_earned: pointsEarned,
            completed_at: new Date().toISOString()
        };
        db.test_results.push(result);
        saveDB(db);
        return result;
    },

    getUserResults: (userId) => {
        const results = db.test_results.filter(r => r.user_id === parseInt(userId));
        return {
            total_points: results.reduce((sum, r) => sum + r.points_earned, 0),
            total_questions: results.length,
            correct_answers: results.filter(r => r.is_correct === 1).length
        };
    },

    getAllUsersWithStats: () => {
        return db.users.map(user => {
            const userResults = db.test_results.filter(r => r.user_id === user.id);
            const uniqueQuestions = [...new Set(userResults.map(r => r.question_id))];

            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                created_at: user.created_at,
                total_points: userResults.reduce((sum, r) => sum + r.points_earned, 0),
                questions_answered: uniqueQuestions.length,
                correct_answers: userResults.filter(r => r.is_correct === 1).length
            };
        }).sort((a, b) => b.total_points - a.total_points);
    },

    getLeaderboard: (limit = 10) => {
        return database.getAllUsersWithStats().slice(0, limit);
    }
};

function initDatabase() {
    console.log('✅ Veritabanı başlatıldı!');
    console.log('✅ Varsayılan admin: admin / admin123');
}

module.exports = { database, initDatabase };
