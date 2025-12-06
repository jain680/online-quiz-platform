const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  challenger: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    answers: [Number],
    completed: { type: Boolean, default: false },
    timeTaken: Number
  },
  opponent: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    answers: [Number],
    completed: { type: Boolean, default: false },
    timeTaken: Number
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  coinReward: {
    type: Number,
    default: 50
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Battle', battleSchema);
