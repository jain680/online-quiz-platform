const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Result = require('../models/Result');
const { auth } = require('../middleware/auth');
const { achievements } = require('../data/achievements');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, featured } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation')
      .populate('createdBy', 'name avatar level')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyQuiz = await Quiz.findOne({ isDaily: true, isPublished: true })
      .populate('createdBy', 'name avatar');
    
    if (!dailyQuiz) {
      dailyQuiz = await Quiz.findOne({ isPublished: true })
        .sort({ playCount: 1 })
        .populate('createdBy', 'name avatar');
    }
    
    res.json(dailyQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Quiz.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, icon: { $first: '$icon' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name avatar level');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
      timeBonus: q.timeBonus,
      hint: q.hint
    }));

    res.json(quizData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user._id
    });

    await quiz.save();
    
    // Check quiz creator achievement
    const user = await User.findById(req.user._id);
    const hasAchievement = user.achievements.find(a => a.id === 'quiz_creator');
    if (!hasAchievement) {
      const achievement = achievements.find(a => a.id === 'quiz_creator');
      user.achievements.push({ id: achievement.id, name: achievement.name, icon: achievement.icon });
      user.addXP(achievement.xp);
      await user.save();
    }
    
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { answers, timeTaken, powerUpsUsed = [] } = req.body;
    const user = await User.findById(req.user._id);
    
    let score = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let combo = 0;
    let maxCombo = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        
        let points = question.points;
        // Combo bonus
        if (combo >= 3) points += Math.floor(combo * 2);
        score += points;
      } else {
        combo = 0;
      }
      
      totalPoints += question.points;

      results.push({
        questionId: question._id,
        selectedAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const isPerfect = percentage === 100;
    
    // Calculate XP earned
    let xpEarned = quiz.xpReward;
    if (isPerfect) xpEarned *= 2;
    if (maxCombo >= 5) xpEarned += 50;
    
    // Double XP power-up
    if (powerUpsUsed.includes('doubleXp')) {
      xpEarned *= 2;
    }
    
    // Calculate coins earned
    let coinsEarned = Math.floor(quiz.coinReward * (percentage / 100));
    if (isPerfect) coinsEarned += 25;
    
    // Update user stats
    user.stats.totalQuizzes += 1;
    user.stats.totalCorrect += correctCount;
    user.stats.totalQuestions += quiz.questions.length;
    if (isPerfect) user.stats.perfectScores += 1;
    if (!user.stats.fastestQuiz || timeTaken < user.stats.fastestQuiz) {
      user.stats.fastestQuiz = timeTaken;
    }
    
    // Update streak
    const streakUpdated = user.updateStreak();
    
    // Add XP and coins
    const levelUp = user.addXP(xpEarned);
    user.coins += coinsEarned;
    
    // Deduct used power-ups
    powerUpsUsed.forEach(pu => {
      if (user.powerUps[pu] > 0) user.powerUps[pu] -= 1;
    });
    
    // Check achievements
    const newAchievements = [];
    const checkAchievements = [
      { id: 'first_quiz', condition: user.stats.totalQuizzes === 1 },
      { id: 'first_perfect', condition: isPerfect && user.stats.perfectScores === 1 },
      { id: 'five_quizzes', condition: user.stats.totalQuizzes === 5 },
      { id: 'streak_3', condition: user.streak.current === 3 },
      { id: 'streak_7', condition: user.streak.current === 7 },
      { id: 'streak_30', condition: user.streak.current === 30 },
      { id: 'score_1000', condition: user.xp >= 1000 },
      { id: 'score_5000', condition: user.xp >= 5000 },
      { id: 'speed_demon', condition: timeTaken < 60 },
      { id: 'level_5', condition: user.level >= 5 },
      { id: 'level_10', condition: user.level >= 10 }
    ];
    
    for (const check of checkAchievements) {
      if (check.condition && !user.achievements.find(a => a.id === check.id)) {
        const achievement = achievements.find(a => a.id === check.id);
        if (achievement) {
          user.achievements.push({ id: achievement.id, name: achievement.name, icon: achievement.icon });
          user.addXP(achievement.xp);
          newAchievements.push(achievement);
        }
      }
    }
    
    await user.save();
    
    // Update quiz stats
    quiz.playCount += 1;
    quiz.avgScore = ((quiz.avgScore * (quiz.playCount - 1)) + percentage) / quiz.playCount;
    await quiz.save();

    // Save result
    const result = new Result({
      user: user._id,
      quiz: quiz._id,
      answers: results.map(r => ({ questionId: r.questionId, selectedAnswer: r.selectedAnswer, isCorrect: r.isCorrect })),
      score,
      totalPoints,
      percentage,
      timeTaken,
      xpEarned,
      coinsEarned,
      maxCombo,
      powerUpsUsed,
      isPerfect
    });
    await result.save();

    res.json({
      score,
      totalPoints,
      percentage,
      results,
      xpEarned,
      coinsEarned,
      maxCombo,
      isPerfect,
      levelUp,
      newAchievements,
      streak: user.streak,
      user: {
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        powerUps: user.powerUps
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    Object.assign(quiz, req.body);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
