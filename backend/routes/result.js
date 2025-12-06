const express = require('express');
const Result = require('../models/Result');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/my-results', auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title category difficulty icon')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await Result.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('quiz');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/quiz/:quizId/leaderboard', async (req, res) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('user', 'name avatar level')
      .sort({ percentage: -1, timeTaken: 1 })
      .limit(10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
