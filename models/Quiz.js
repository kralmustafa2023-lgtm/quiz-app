const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question_text: { type: String, required: true },
    option_a: { type: String, required: true },
    option_b: { type: String, required: true },
    option_c: { type: String, required: true },
    option_d: { type: String, required: true },
    correct_answer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    points: { type: Number, default: 10 }
});

const QuizSchema = new mongoose.Schema({
    quiz_code: { type: String, required: true, unique: true },
    creator_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
