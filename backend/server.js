const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const db = require('./db/memory');
const { achievements, titles, avatars } = require('./data/achievements');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, 'public','build')));

const JWT_SECRET = process.env.JWT_SECRET || 'quiz-master-secret-key';

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper to add XP
const addXP = (user, amount) => {
  user.xp += amount;
  const newLevel = Math.floor(user.xp / 500) + 1;
  const leveledUp = newLevel > user.level;
  user.level = newLevel;
  db.updateUser(user._id, { xp: user.xp, level: user.level });
  return { leveledUp, newLevel };
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (db.findUserByEmail(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await db.createUser({ name, email, password });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await db.comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

app.get('/api/auth/leaderboard', (req, res) => {
  const users = db.getAllUsers().slice(0, 50).map(u => ({
    _id: u._id, name: u.name, avatar: u.avatar, title: u.title, xp: u.xp, level: u.level, stats: u.stats
  }));
  res.json(users);
});

app.get('/api/auth/titles', (req, res) => res.json(titles));
app.get('/api/auth/avatars', (req, res) => res.json(avatars));

app.put('/api/auth/profile', auth, (req, res) => {
  const { avatar, title } = req.body;
  const updates = {};
  if (avatar) updates.avatar = avatar;
  if (title) updates.title = title;
  db.updateUser(req.user._id, updates);
  res.json({ message: 'Profile updated', ...updates });
});

// ============ QUIZ ROUTES ============
app.get('/api/quizzes', (req, res) => {
  const { category, difficulty, search } = req.query;
  const quizzes = db.findQuizzes({ category, difficulty, search });
  res.json(quizzes.map(q => ({
    ...q,
    questions: q.questions.map(({ correctAnswer, explanation, ...rest }) => rest)
  })));
});

app.get('/api/quizzes/categories', (req, res) => {
  res.json(db.getCategories());
});

app.get('/api/quizzes/daily', (req, res) => {
  const quizzes = db.findQuizzes({});
  res.json(quizzes[0] || null);
});

app.get('/api/quizzes/my-quizzes', auth, (req, res) => {
  res.json(db.findQuizzesByUser(req.user._id));
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = db.findQuizById(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  
  res.json({
    ...quiz,
    questions: quiz.questions.map(({ correctAnswer, explanation, ...rest }) => rest)
  });
});

app.post('/api/quizzes', auth, (req, res) => {
  const quiz = db.createQuiz(req.body, req.user._id);
  res.status(201).json(quiz);
});

app.post('/api/quizzes/:id/submit', auth, (req, res) => {
  try {
    const quiz = db.findQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers, timeTaken, powerUpsUsed = [] } = req.body;
    const user = req.user;
    
    let score = 0, totalPoints = 0, correctCount = 0, combo = 0, maxCombo = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        let points = question.points || 10;
        if (combo >= 3) points += Math.floor(combo * 2);
        score += points;
      } else {
        combo = 0;
      }
      totalPoints += question.points || 10;

      results.push({
        questionId: question._id,
        selectedAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points || 10,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const isPerfect = percentage === 100;
    
    let xpEarned = quiz.xpReward || 50;
    if (isPerfect) xpEarned *= 2;
    if (maxCombo >= 5) xpEarned += 50;
    if (powerUpsUsed.includes('doubleXp')) xpEarned *= 2;
    
    let coinsEarned = Math.floor((quiz.coinReward || 25) * (percentage / 100));
    if (isPerfect) coinsEarned += 25;

    // Update user stats
    user.stats.totalQuizzes += 1;
    user.stats.totalCorrect += correctCount;
    user.stats.totalQuestions += quiz.questions.length;
    if (isPerfect) user.stats.perfectScores += 1;

    // Update streak
    const today = new Date().toDateString();
    const lastPlayed = user.streak.lastPlayedDate ? new Date(user.streak.lastPlayedDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastPlayed !== today) {
      if (lastPlayed === yesterday) {
        user.streak.current += 1;
      } else {
        user.streak.current = 1;
      }
      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
      }
      user.streak.lastPlayedDate = new Date();
    }

    const levelUp = addXP(user, xpEarned);
    user.coins += coinsEarned;

    // Deduct power-ups
    powerUpsUsed.forEach(pu => {
      if (user.powerUps[pu] > 0) user.powerUps[pu] -= 1;
    });

    // Check achievements
    const newAchievements = [];
    const checks = [
      { id: 'first_quiz', condition: user.stats.totalQuizzes === 1 },
      { id: 'first_perfect', condition: isPerfect && user.stats.perfectScores === 1 },
      { id: 'five_quizzes', condition: user.stats.totalQuizzes === 5 },
      { id: 'streak_3', condition: user.streak.current === 3 },
      { id: 'streak_7', condition: user.streak.current === 7 },
      { id: 'score_1000', condition: user.xp >= 1000 },
      { id: 'speed_demon', condition: timeTaken < 60 },
      { id: 'level_5', condition: user.level >= 5 },
      { id: 'level_10', condition: user.level >= 10 }
    ];

    for (const check of checks) {
      if (check.condition && !user.achievements.find(a => a.id === check.id)) {
        const achievement = achievements.find(a => a.id === check.id);
        if (achievement) {
          user.achievements.push({ id: achievement.id, name: achievement.name, icon: achievement.icon });
          addXP(user, achievement.xp);
          newAchievements.push(achievement);
        }
      }
    }

    db.updateUser(user._id, user);

    // Update quiz stats
    quiz.playCount = (quiz.playCount || 0) + 1;
    quiz.avgScore = ((quiz.avgScore || 0) * (quiz.playCount - 1) + percentage) / quiz.playCount;
    db.updateQuiz(quiz._id, { playCount: quiz.playCount, avgScore: quiz.avgScore });

    // Save result
    db.createResult({
      user: user._id,
      quiz: quiz._id,
      answers: results.map(r => ({ questionId: r.questionId, selectedAnswer: r.selectedAnswer, isCorrect: r.isCorrect })),
      score, totalPoints, percentage, timeTaken, xpEarned, coinsEarned, maxCombo, powerUpsUsed, isPerfect
    });

    res.json({
      score, totalPoints, percentage, results, xpEarned, coinsEarned, maxCombo, isPerfect, levelUp, newAchievements,
      streak: user.streak,
      user: { xp: user.xp, level: user.level, coins: user.coins, powerUps: user.powerUps }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ RESULTS ROUTES ============
app.get('/api/results/my-results', auth, (req, res) => {
  res.json(db.findResultsByUser(req.user._id));
});

// ============ SHOP ROUTES ============
const shopItems = {
  powerUps: [
    { id: 'fiftyFifty', name: '50/50', description: 'Remove 2 wrong answers', price: 50, currency: 'coins', icon: '🎯' },
    { id: 'freezeTime', name: 'Freeze Time', description: 'Stop timer for 10 seconds', price: 75, currency: 'coins', icon: '❄️' },
    { id: 'skipQuestion', name: 'Skip', description: 'Skip without penalty', price: 100, currency: 'coins', icon: '⏭️' },
    { id: 'doubleXp', name: 'Double XP', description: 'Double XP for quiz', price: 5, currency: 'gems', icon: '✨' },
    { id: 'shield', name: 'Shield', description: 'Protect streak', price: 10, currency: 'gems', icon: '🛡️' }
  ],
  bundles: [
    { id: 'starter_pack', name: 'Starter Pack', description: '3x each power-up', price: 25, currency: 'gems', items: { fiftyFifty: 3, freezeTime: 3, skipQuestion: 3 }, icon: '📦' },
    { id: 'pro_pack', name: 'Pro Pack', description: '5x each + Double XP', price: 50, currency: 'gems', items: { fiftyFifty: 5, freezeTime: 5, skipQuestion: 5, doubleXp: 3 }, icon: '🎁' }
  ],
  coins: [
    { id: 'coins_100', name: '100 Coins', price: 1, currency: 'gems', amount: 100, icon: '🪙' },
    { id: 'coins_500', name: '500 Coins', price: 4, currency: 'gems', amount: 500, icon: '💰' }
  ]
};

app.get('/api/shop', (req, res) => res.json(shopItems));

app.post('/api/shop/buy', auth, (req, res) => {
  const { itemId, category } = req.body;
  const user = req.user;
  
  let item = shopItems[category]?.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (item.currency === 'coins' && user.coins < item.price) {
    return res.status(400).json({ message: 'Not enough coins' });
  }
  if (item.currency === 'gems' && user.gems < item.price) {
    return res.status(400).json({ message: 'Not enough gems' });
  }

  if (item.currency === 'coins') user.coins -= item.price;
  else user.gems -= item.price;

  if (category === 'powerUps') user.powerUps[itemId] += 1;
  else if (category === 'bundles') {
    for (const [key, value] of Object.entries(item.items)) {
      user.powerUps[key] += value;
    }
  } else if (category === 'coins') user.coins += item.amount;

  db.updateUser(user._id, user);
  res.json({ message: 'Purchase successful', coins: user.coins, gems: user.gems, powerUps: user.powerUps });
});

app.post('/api/shop/daily-reward', auth, (req, res) => {
  const user = req.user;
  const today = new Date().toDateString();
  const lastClaimed = user.dailyChallenge.lastCompleted 
    ? new Date(user.dailyChallenge.lastCompleted).toDateString() 
    : null;

  if (lastClaimed === today) {
    return res.status(400).json({ message: 'Already claimed today' });
  }

  const streakBonus = Math.min(user.streak.current, 7);
  const coinReward = 50 + (streakBonus * 10);
  const xpReward = 25 + (streakBonus * 5);
  const gemReward = user.streak.current > 0 && user.streak.current % 7 === 0 ? 1 : 0;

  user.coins += coinReward;
  user.gems += gemReward;
  addXP(user, xpReward);
  user.dailyChallenge.lastCompleted = new Date();

  db.updateUser(user._id, user);
  res.json({ coins: coinReward, gems: gemReward, xp: xpReward, streak: user.streak.current });
});

// ============ BATTLES ROUTES ============
app.get('/api/battles/open', auth, (req, res) => {
  res.json(db.findOpenBattles(req.user._id));
});

app.get('/api/battles/my-battles', auth, (req, res) => {
  res.json(db.findBattlesByUser(req.user._id));
});

app.post('/api/battles/challenge', auth, (req, res) => {
  const { quizId } = req.body;
  const quiz = db.findQuizById(quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const battle = db.createBattle({
    quiz: quizId,
    challenger: { user: req.user._id, score: 0, completed: false },
    status: 'pending',
    xpReward: (quiz.xpReward || 50) * 2,
    coinReward: (quiz.coinReward || 25) * 2
  });
  res.status(201).json(battle);
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','build' ,'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Using in-memory database (data resets on restart)`);
  console.log(`🎮 3 sample quizzes loaded and ready!`);
});
