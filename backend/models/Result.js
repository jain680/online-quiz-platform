const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  maxCombo: {
    type: Number,
    default: 0
  },
  powerUpsUsed: [{
    type: String
  }],
  isPerfect: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
