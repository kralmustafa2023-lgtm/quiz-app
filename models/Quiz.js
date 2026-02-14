const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true }
    },
    correct_answer: { type: String, required: true, enum: ['a', 'b', 'c', 'd'] },
    points: { type: Number, default: 10 }
});

const QuizSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 6-digit unique code
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
