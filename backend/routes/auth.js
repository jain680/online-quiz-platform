const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { titles, avatars } = require('../data/achievements');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        gems: user.gems,
        streak: user.streak,
        powerUps: user.powerUps,
        stats: user.stats,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        gems: user.gems,
        streak: user.streak,
        powerUps: user.powerUps,
        stats: user.stats,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    title: user.title,
    xp: user.xp,
    level: user.level,
    coins: user.coins,
    gems: user.gems,
    streak: user.streak,
    powerUps: user.powerUps,
    stats: user.stats,
    achievements: user.achievements
  });
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('name avatar title xp level stats.totalQuizzes')
      .sort({ xp: -1 })
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/titles', (req, res) => {
  res.json(titles);
});

router.get('/avatars', (req, res) => {
  res.json(avatars);
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { avatar, title } = req.body;
    const user = await User.findById(req.user._id);
    
    if (avatar) user.avatar = avatar;
    if (title) user.title = title;
    
    await user.save();
    res.json({ message: 'Profile updated', avatar: user.avatar, title: user.title });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
