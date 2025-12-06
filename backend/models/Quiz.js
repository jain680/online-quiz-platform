const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    default: 10
  },
  timeBonus: {
    type: Number,
    default: 5
  },
  hint: String,
  explanation: String
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📚'
  },
  theme: {
    type: String,
    enum: ['default', 'neon', 'nature', 'space', 'ocean', 'fire', 'cyber'],
    default: 'default'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    default: 'medium'
  },
  xpReward: {
    type: Number,
    default: 50
  },
  coinReward: {
    type: Number,
    default: 25
  },
  timeLimit: {
    type: Number,
    default: 30
  },
  timePerQuestion: {
    type: Number,
    default: 30
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDaily: {
    type: Boolean,
    default: false
  },
  playCount: {
    type: Number,
    default: 0
  },
  avgScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
