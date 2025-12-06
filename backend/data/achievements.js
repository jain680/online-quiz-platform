const achievements = [
  // Beginner achievements
  { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', xp: 50 },
  { id: 'first_perfect', name: 'Perfectionist', description: 'Get 100% on any quiz', icon: '💯', xp: 100 },
  { id: 'five_quizzes', name: 'Getting Started', description: 'Complete 5 quizzes', icon: '📝', xp: 75 },
  
  // Streak achievements
  { id: 'streak_3', name: 'On Fire', description: '3 day streak', icon: '🔥', xp: 100 },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '⚡', xp: 200 },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '👑', xp: 500 },
  
  // Score achievements
  { id: 'score_1000', name: 'Point Collector', description: 'Earn 1000 total XP', icon: '⭐', xp: 100 },
  { id: 'score_5000', name: 'XP Hunter', description: 'Earn 5000 total XP', icon: '🌟', xp: 250 },
  { id: 'score_10000', name: 'XP Legend', description: 'Earn 10000 total XP', icon: '💫', xp: 500 },
  
  // Speed achievements
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quiz in under 1 minute', icon: '⚡', xp: 150 },
  { id: 'lightning', name: 'Lightning Fast', description: 'Answer 10 questions in under 5 seconds each', icon: '🌩️', xp: 200 },
  
  // Battle achievements
  { id: 'first_battle', name: 'Challenger', description: 'Win your first battle', icon: '⚔️', xp: 100 },
  { id: 'battle_master', name: 'Battle Master', description: 'Win 10 battles', icon: '🏆', xp: 300 },
  { id: 'undefeated', name: 'Undefeated', description: 'Win 5 battles in a row', icon: '🛡️', xp: 400 },
  
  // Category achievements
  { id: 'science_whiz', name: 'Science Whiz', description: 'Complete 10 Science quizzes', icon: '🔬', xp: 150 },
  { id: 'history_buff', name: 'History Buff', description: 'Complete 10 History quizzes', icon: '📜', xp: 150 },
  { id: 'tech_guru', name: 'Tech Guru', description: 'Complete 10 Technology quizzes', icon: '💻', xp: 150 },
  
  // Special achievements
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a quiz after midnight', icon: '🦉', xp: 75 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a quiz before 6 AM', icon: '🐦', xp: 75 },
  { id: 'quiz_creator', name: 'Quiz Creator', description: 'Create your first quiz', icon: '✍️', xp: 100 },
  { id: 'popular_creator', name: 'Popular Creator', description: 'Have 100 people play your quiz', icon: '🌟', xp: 300 },
  
  // Level achievements
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '🌱', xp: 100 },
  { id: 'level_10', name: 'Quiz Pro', description: 'Reach level 10', icon: '🌳', xp: 200 },
  { id: 'level_25', name: 'Quiz Master', description: 'Reach level 25', icon: '🏅', xp: 400 },
  { id: 'level_50', name: 'Quiz Legend', description: 'Reach level 50', icon: '👑', xp: 1000 }
];

const titles = [
  { level: 1, title: 'Novice Quizzer' },
  { level: 5, title: 'Quiz Apprentice' },
  { level: 10, title: 'Knowledge Seeker' },
  { level: 15, title: 'Quiz Warrior' },
  { level: 20, title: 'Trivia Champion' },
  { level: 25, title: 'Quiz Master' },
  { level: 30, title: 'Wisdom Keeper' },
  { level: 40, title: 'Grand Quizzer' },
  { level: 50, title: 'Quiz Legend' },
  { level: 75, title: 'Eternal Scholar' },
  { level: 100, title: 'Quiz Deity' }
];

const avatars = [
  { id: 'wizard', name: 'Wizard', icon: '🧙', unlockLevel: 1 },
  { id: 'knight', name: 'Knight', icon: '🤺', unlockLevel: 5 },
  { id: 'ninja', name: 'Ninja', icon: '🥷', unlockLevel: 10 },
  { id: 'robot', name: 'Robot', icon: '🤖', unlockLevel: 15 },
  { id: 'alien', name: 'Alien', icon: '👽', unlockLevel: 20 },
  { id: 'dragon', name: 'Dragon', icon: '🐉', unlockLevel: 25 },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', unlockLevel: 30 },
  { id: 'unicorn', name: 'Unicorn', icon: '🦄', unlockLevel: 40 },
  { id: 'crown', name: 'Royal', icon: '👑', unlockLevel: 50 }
];

module.exports = { achievements, titles, avatars };
