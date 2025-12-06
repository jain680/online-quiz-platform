const bcrypt = require('bcryptjs');

const db = {
  users: [],
  quizzes: [
    {
      _id: 'quiz1',
      title: 'General Knowledge',
      description: 'Test your general knowledge!',
      category: 'General',
      icon: '🧠',
      difficulty: 'medium',
      xpReward: 50,
      coinReward: 25,
      timeLimit: 5,
      isPublished: true,
      playCount: 0,
      avgScore: 0,
      createdBy: { name: 'Admin', avatar: 'wizard', level: 10 },
      questions: [
        { _id: 'q1', question: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], correctAnswer: 1, points: 10, explanation: 'Paris is the capital of France.' },
        { _id: 'q2', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 2, points: 10, explanation: 'Mars appears red due to iron oxide on its surface.' },
        { _id: 'q3', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1, points: 10, explanation: 'Basic math: 2 + 2 = 4' },
        { _id: 'q4', question: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Monet'], correctAnswer: 2, points: 10, explanation: 'Leonardo da Vinci painted the Mona Lisa.' },
        { _id: 'q5', question: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correctAnswer: 2, points: 10, explanation: 'The Pacific Ocean is the largest ocean on Earth.' }
      ]
    },
    {
      _id: 'quiz2',
      title: 'Science Quiz',
      description: 'How well do you know science?',
      category: 'Science',
      icon: '🔬',
      difficulty: 'hard',
      xpReward: 75,
      coinReward: 40,
      timeLimit: 10,
      isPublished: true,
      playCount: 0,
      avgScore: 0,
      createdBy: { name: 'Admin', avatar: 'robot', level: 15 },
      questions: [
        { _id: 'q6', question: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correctAnswer: 1, points: 10, explanation: 'Au comes from the Latin word "aurum".' },
        { _id: 'q7', question: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], correctAnswer: 0, points: 10, explanation: 'Light travels at approximately 300,000 km/s.' },
        { _id: 'q8', question: 'What is H2O commonly known as?', options: ['Salt', 'Sugar', 'Water', 'Oxygen'], correctAnswer: 2, points: 10, explanation: 'H2O is the chemical formula for water.' },
        { _id: 'q9', question: 'How many bones are in the human body?', options: ['106', '206', '306', '406'], correctAnswer: 1, points: 10, explanation: 'Adults have 206 bones.' },
        { _id: 'q10', question: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2, points: 10, explanation: 'Plants absorb CO2 for photosynthesis.' }
      ]
    },
    {
      _id: 'quiz3',
      title: 'Tech Trivia',
      description: 'Are you a tech geek?',
      category: 'Technology',
      icon: '💻',
      difficulty: 'easy',
      xpReward: 40,
      coinReward: 20,
      timeLimit: 5,
      isPublished: true,
      playCount: 0,
      avgScore: 0,
      createdBy: { name: 'Admin', avatar: 'ninja', level: 12 },
      questions: [
        { _id: 'q11', question: 'Who founded Microsoft?', options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk'], correctAnswer: 1, points: 10, explanation: 'Bill Gates co-founded Microsoft with Paul Allen.' },
        { _id: 'q12', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctAnswer: 0, points: 10, explanation: 'CPU = Central Processing Unit.' },
        { _id: 'q13', question: 'What year was the iPhone first released?', options: ['2005', '2007', '2009', '2010'], correctAnswer: 1, points: 10, explanation: 'The first iPhone was released in 2007.' },
        { _id: 'q14', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0, points: 10, explanation: 'HTML = Hyper Text Markup Language.' },
        { _id: 'q15', question: 'Which company created Android?', options: ['Apple', 'Microsoft', 'Google', 'Samsung'], correctAnswer: 2, points: 10, explanation: 'Google acquired and developed Android.' }
      ]
    }
  ],
  results: [],
  battles: []
};

let userIdCounter = 1;
let quizIdCounter = 100;
let resultIdCounter = 1;

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

const memoryDB = {
  // Users
  findUserByEmail: (email) => db.users.find(u => u.email === email),
  findUserById: (id) => db.users.find(u => u._id === id),
  createUser: async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = {
      _id: generateId('user'),
      ...userData,
      password: hashedPassword,
      avatar: 'wizard',
      title: 'Novice Quizzer',
      role: 'user',
      xp: 0,
      level: 1,
      coins: 100,
      gems: 10,
      streak: { current: 0, longest: 0, lastPlayedDate: null },
      powerUps: { fiftyFifty: 3, freezeTime: 2, skipQuestion: 2, doubleXp: 1, shield: 1 },
      stats: { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0, perfectScores: 0, battlesWon: 0, battlesPlayed: 0, winStreak: 0 },
      achievements: [],
      dailyChallenge: { completed: false, lastCompleted: null },
      createdAt: new Date()
    };
    db.users.push(user);
    return user;
  },
  updateUser: (id, updates) => {
    const index = db.users.findIndex(u => u._id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updates };
      return db.users[index];
    }
    return null;
  },
  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },
  getAllUsers: () => db.users.sort((a, b) => b.xp - a.xp),

  // Quizzes
  findQuizzes: (filter = {}) => {
    let quizzes = db.quizzes.filter(q => q.isPublished);
    if (filter.category) quizzes = quizzes.filter(q => q.category === filter.category);
    if (filter.difficulty) quizzes = quizzes.filter(q => q.difficulty === filter.difficulty);
    if (filter.search) {
      const search = filter.search.toLowerCase();
      quizzes = quizzes.filter(q => q.title.toLowerCase().includes(search) || q.description.toLowerCase().includes(search));
    }
    return quizzes;
  },
  findQuizById: (id) => db.quizzes.find(q => q._id === id),
  findQuizzesByUser: (userId) => db.quizzes.filter(q => q.createdBy?._id === userId || q.createdBy === userId),
  createQuiz: (quizData, userId) => {
    const user = db.users.find(u => u._id === userId);
    const quiz = {
      _id: generateId('quiz'),
      ...quizData,
      createdBy: user ? { _id: user._id, name: user.name, avatar: user.avatar, level: user.level } : userId,
      playCount: 0,
      avgScore: 0,
      createdAt: new Date()
    };
    quiz.questions = quiz.questions.map((q, i) => ({ ...q, _id: `${quiz._id}_q${i}` }));
    db.quizzes.push(quiz);
    return quiz;
  },
  updateQuiz: (id, updates) => {
    const index = db.quizzes.findIndex(q => q._id === id);
    if (index !== -1) {
      db.quizzes[index] = { ...db.quizzes[index], ...updates };
      return db.quizzes[index];
    }
    return null;
  },
  getCategories: () => {
    const cats = {};
    db.quizzes.filter(q => q.isPublished).forEach(q => {
      cats[q.category] = (cats[q.category] || 0) + 1;
    });
    return Object.entries(cats).map(([_id, count]) => ({ _id, count }));
  },

  // Results
  createResult: (resultData) => {
    const result = {
      _id: generateId('result'),
      ...resultData,
      completedAt: new Date()
    };
    db.results.push(result);
    return result;
  },
  findResultsByUser: (userId) => {
    return db.results
      .filter(r => r.user === userId)
      .map(r => ({
        ...r,
        quiz: db.quizzes.find(q => q._id === r.quiz)
      }))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  },

  // Battles
  createBattle: (battleData) => {
    const battle = {
      _id: generateId('battle'),
      ...battleData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    db.battles.push(battle);
    return battle;
  },
  findOpenBattles: (userId) => db.battles.filter(b => b.status === 'pending' && b.challenger?.user !== userId && !b.opponent?.user),
  findBattlesByUser: (userId) => db.battles.filter(b => b.challenger?.user === userId || b.opponent?.user === userId),
  findBattleById: (id) => db.battles.find(b => b._id === id),
  updateBattle: (id, updates) => {
    const index = db.battles.findIndex(b => b._id === id);
    if (index !== -1) {
      db.battles[index] = { ...db.battles[index], ...updates };
      return db.battles[index];
    }
    return null;
  }
};

module.exports = memoryDB;
