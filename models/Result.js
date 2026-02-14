const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    user_name: { type: String, required: true },
    score: { type: Number, required: true },
    max_score: { type: Number, required: true },
    answers: [{
        question_id: String,
        given_answer: String,
        correct_answer: String,
        is_correct: Boolean
    }],
    completed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
