const mongoose = require('mongoose');

const ParticipantAnswerSchema = new mongoose.Schema({
    question_id: { type: String, required: true },
    answer: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
    points_earned: { type: Number, default: 0 }
});

const ResultSchema = new mongoose.Schema({
    quiz_code: { type: String, required: true },
    participant_name: { type: String, required: true },
    score: { type: Number, default: 0 },
    max_score: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    total_questions: { type: Number, default: 0 },
    answers: [ParticipantAnswerSchema],
    completed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
