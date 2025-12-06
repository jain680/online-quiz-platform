const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const shopItems = {
  powerUps: [
    { id: 'fiftyFifty', name: '50/50', description: 'Remove 2 wrong answers', price: 50, currency: 'coins', icon: '🎯' },
    { id: 'freezeTime', name: 'Freeze Time', description: 'Stop the timer for 10 seconds', price: 75, currency: 'coins', icon: '❄️' },
    { id: 'skipQuestion', name: 'Skip', description: 'Skip a question without penalty', price: 100, currency: 'coins', icon: '⏭️' },
    { id: 'doubleXp', name: 'Double XP', description: 'Double XP for entire quiz', price: 5, currency: 'gems', icon: '✨' },
    { id: 'shield', name: 'Shield', description: 'Protect your streak if you fail', price: 10, currency: 'gems', icon: '🛡️' }
  ],
  bundles: [
    { id: 'starter_pack', name: 'Starter Pack', description: '3x each power-up', price: 25, currency: 'gems', items: { fiftyFifty: 3, freezeTime: 3, skipQuestion: 3 }, icon: '📦' },
    { id: 'pro_pack', name: 'Pro Pack', description: '5x each power-up + Double XP', price: 50, currency: 'gems', items: { fiftyFifty: 5, freezeTime: 5, skipQuestion: 5, doubleXp: 3 }, icon: '🎁' }
  ],
  coins: [
    { id: 'coins_100', name: '100 Coins', price: 1, currency: 'gems', amount: 100, icon: '🪙' },
    { id: 'coins_500', name: '500 Coins', price: 4, currency: 'gems', amount: 500, icon: '💰' },
    { id: 'coins_1000', name: '1000 Coins', price: 7, currency: 'gems', amount: 1000, icon: '💎' }
  ]
};

router.get('/', (req, res) => {
  res.json(shopItems);
});

router.post('/buy', auth, async (req, res) => {
  try {
    const { itemId, category } = req.body;
    const user = await User.findById(req.user._id);

    let item;
    if (category === 'powerUps') {
      item = shopItems.powerUps.find(i => i.id === itemId);
    } else if (category === 'bundles') {
      item = shopItems.bundles.find(i => i.id === itemId);
    } else if (category === 'coins') {
      item = shopItems.coins.find(i => i.id === itemId);
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user has enough currency
    if (item.currency === 'coins' && user.coins < item.price) {
      return res.status(400).json({ message: 'Not enough coins' });
    }
    if (item.currency === 'gems' && user.gems < item.price) {
      return res.status(400).json({ message: 'Not enough gems' });
    }

    // Deduct currency
    if (item.currency === 'coins') {
      user.coins -= item.price;
    } else {
      user.gems -= item.price;
    }

    // Add items
    if (category === 'powerUps') {
      user.powerUps[itemId] += 1;
    } else if (category === 'bundles') {
      for (const [key, value] of Object.entries(item.items)) {
        user.powerUps[key] += value;
      }
    } else if (category === 'coins') {
      user.coins += item.amount;
    }

    await user.save();

    res.json({
      message: 'Purchase successful',
      coins: user.coins,
      gems: user.gems,
      powerUps: user.powerUps
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Daily reward
router.post('/daily-reward', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const lastClaimed = user.dailyChallenge.lastCompleted 
      ? new Date(user.dailyChallenge.lastCompleted).toDateString() 
      : null;

    if (lastClaimed === today) {
      return res.status(400).json({ message: 'Already claimed today' });
    }

    // Reward based on streak
    const streakBonus = Math.min(user.streak.current, 7);
    const coinReward = 50 + (streakBonus * 10);
    const xpReward = 25 + (streakBonus * 5);
    
    // Bonus gem every 7 days
    const gemReward = user.streak.current % 7 === 0 ? 1 : 0;

    user.coins += coinReward;
    user.gems += gemReward;
    user.addXP(xpReward);
    user.dailyChallenge.lastCompleted = new Date();

    await user.save();

    res.json({
      coins: coinReward,
      gems: gemReward,
      xp: xpReward,
      streak: user.streak.current,
      user: {
        coins: user.coins,
        gems: user.gems,
        xp: user.xp
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
