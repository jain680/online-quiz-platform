const express = require('express');
const Battle = require('../models/Battle');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { achievements } = require('../data/achievements');

const router = express.Router();

// Create a battle challenge
router.post('/challenge', auth, async (req, res) => {
  try {
    const { quizId, opponentId } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const battle = new Battle({
      quiz: quizId,
      challenger: { user: req.user._id },
      opponent: opponentId ? { user: opponentId } : undefined,
      xpReward: quiz.xpReward * 2,
      coinReward: quiz.coinReward * 2
    });

    await battle.save();
    res.status(201).json(battle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get open battles (matchmaking)
router.get('/open', auth, async (req, res) => {
  try {
    const battles = await Battle.find({
      status: 'pending',
      'challenger.user': { $ne: req.user._id },
      'opponent.user': { $exists: false }
    })
    .populate('quiz', 'title category difficulty icon')
    .populate('challenger.user', 'name avatar level')
    .limit(10);

    res.json(battles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a battle
router.post('/:id/join', auth, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (battle.status !== 'pending') {
      return res.status(400).json({ message: 'Battle is no longer available' });
    }

    if (battle.challenger.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot join your own battle' });
    }

    battle.opponent = { user: req.user._id };
    battle.status = 'active';
    await battle.save();

    res.json(battle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit battle answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id).populate('quiz');
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    const { answers, timeTaken } = req.body;
    const userId = req.user._id.toString();
    const isChallenger = battle.challenger.user.toString() === userId;
    const isOpponent = battle.opponent?.user?.toString() === userId;

    if (!isChallenger && !isOpponent) {
      return res.status(403).json({ message: 'Not part of this battle' });
    }

    // Calculate score
    let score = 0;
    battle.quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points;
      }
    });

    // Update the appropriate player
    if (isChallenger) {
      battle.challenger.score = score;
      battle.challenger.answers = answers;
      battle.challenger.completed = true;
      battle.challenger.timeTaken = timeTaken;
    } else {
      battle.opponent.score = score;
      battle.opponent.answers = answers;
      battle.opponent.completed = true;
      battle.opponent.timeTaken = timeTaken;
    }

    // Check if battle is complete
    if (battle.challenger.completed && battle.opponent?.completed) {
      battle.status = 'completed';
      
      // Determine winner
      let winnerId;
      if (battle.challenger.score > battle.opponent.score) {
        winnerId = battle.challenger.user;
      } else if (battle.opponent.score > battle.challenger.score) {
        winnerId = battle.opponent.user;
      } else {
        // Tie-breaker: faster time wins
        winnerId = battle.challenger.timeTaken <= battle.opponent.timeTaken 
          ? battle.challenger.user 
          : battle.opponent.user;
      }
      
      battle.winner = winnerId;

      // Award XP and coins to winner
      const winner = await User.findById(winnerId);
      winner.addXP(battle.xpReward);
      winner.coins += battle.coinReward;
      winner.stats.battlesWon += 1;
      winner.stats.battlesPlayed += 1;
      winner.stats.winStreak += 1;

      // Check battle achievements
      if (winner.stats.battlesWon === 1) {
        const achievement = achievements.find(a => a.id === 'first_battle');
        if (!winner.achievements.find(a => a.id === 'first_battle')) {
          winner.achievements.push({ id: achievement.id, name: achievement.name, icon: achievement.icon });
          winner.addXP(achievement.xp);
        }
      }
      if (winner.stats.battlesWon === 10) {
        const achievement = achievements.find(a => a.id === 'battle_master');
        if (!winner.achievements.find(a => a.id === 'battle_master')) {
          winner.achievements.push({ id: achievement.id, name: achievement.name, icon: achievement.icon });
          winner.addXP(achievement.xp);
        }
      }

      await winner.save();

      // Update loser stats
      const loserId = winnerId.toString() === battle.challenger.user.toString() 
        ? battle.opponent.user 
        : battle.challenger.user;
      const loser = await User.findById(loserId);
      loser.stats.battlesPlayed += 1;
      loser.stats.winStreak = 0;
      loser.addXP(Math.floor(battle.xpReward / 4)); // Consolation XP
      await loser.save();
    }

    await battle.save();

    res.json({
      battle,
      yourScore: score,
      isComplete: battle.status === 'completed',
      winner: battle.winner
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's battles
router.get('/my-battles', auth, async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [
        { 'challenger.user': req.user._id },
        { 'opponent.user': req.user._id }
      ]
    })
    .populate('quiz', 'title category icon')
    .populate('challenger.user', 'name avatar')
    .populate('opponent.user', 'name avatar')
    .populate('winner', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(battles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get battle details
router.get('/:id', auth, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate('quiz')
      .populate('challenger.user', 'name avatar level')
      .populate('opponent.user', 'name avatar level')
      .populate('winner', 'name avatar');

    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    res.json(battle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
