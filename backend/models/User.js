const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const achievementSchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'wizard'
  },
  title: {
    type: String,
    default: 'Novice Quizzer'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Gamification
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  coins: {
    type: Number,
    default: 100
  },
  gems: {
    type: Number,
    default: 10
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastPlayedDate: Date
  },
  // Power-ups inventory
  powerUps: {
    fiftyFifty: { type: Number, default: 3 },
    freezeTime: { type: Number, default: 2 },
    skipQuestion: { type: Number, default: 2 },
    doubleXp: { type: Number, default: 1 },
    shield: { type: Number, default: 1 }
  },
  // Stats
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    fastestQuiz: Number,
    winStreak: { type: Number, default: 0 },
    battlesWon: { type: Number, default: 0 },
    battlesPlayed: { type: Number, default: 0 }
  },
  achievements: [achievementSchema],
  // Daily challenge
  dailyChallenge: {
    completed: { type: Boolean, default: false },
    lastCompleted: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const xpPerLevel = 500;
  const newLevel = Math.floor(this.xp / xpPerLevel) + 1;
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  return { leveledUp, newLevel };
};

userSchema.methods.updateStreak = function() {
  const today = new Date().toDateString();
  const lastPlayed = this.streak.lastPlayedDate ? new Date(this.streak.lastPlayedDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastPlayed === today) {
    return false;
  } else if (lastPlayed === yesterday) {
    this.streak.current += 1;
  } else {
    this.streak.current = 1;
  }

  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }

  this.streak.lastPlayedDate = new Date();
  return true;
};

module.exports = mongoose.model('User', userSchema);
