const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiExtension = require('./extensions/api-extension'); // 导入扩展API

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 使用扩展API路由
app.use('/api', apiExtension);

const db = {
  users: new Map(),
  scores: [],
  userProgress: new Map(),
  nextUserId: 1
};

// 第一章关卡数据
const chapter1Levels = [
  {
    id: 1,
    levelNumber: 1,
    name: "豆浆铺初遇",
    description: "阿饱来到第一家老字号豆浆铺",
    difficulty: "easy",
    specialEffect: "tofuPlatforms",
    targetScore: 10,
    unlocked: true
  },
  {
    id: 2,
    levelNumber: 2,
    name: "油条飘香",
    description: "豆浆要配油条，跳跃穿越油条丛林",
    difficulty: "easy",
    specialEffect: "movingYoutiaoObstacles",
    targetScore: 20,
    unlocked: false
  },
  {
    id: 3,
    levelNumber: 3,
    name: "煎饼摊前",
    description: "排队买煎饼，不能掉队",
    difficulty: "medium",
    specialEffect: "increasedGaps",
    targetScore: 30,
    unlocked: false
  },
  {
    id: 4,
    levelNumber: 4,
    name: "鸡蛋灌饼",
    description: "热气腾腾的鸡蛋灌饼，小心烫脚",
    difficulty: "medium",
    specialEffect: "steamObstacles",
    targetScore: 40,
    unlocked: false
  },
  {
    id: 5,
    levelNumber: 5,
    name: "包子铺挑战",
    description: "大包子小包子，找准落脚点",
    difficulty: "medium",
    specialEffect: "sizeVariationPlatforms",
    targetScore: 50,
    unlocked: false
  },
  {
    id: 6,
    levelNumber: 6,
    name: "小笼汤包",
    description: "轻轻跳跃，别把汤汁洒了",
    difficulty: "hard",
    specialEffect: "doubleCenterScore",
    targetScore: 60,
    unlocked: false
  },
  {
    id: 7,
    levelNumber: 7,
    name: "豆腐脑之选",
    description: "咸甜之争，选择你的阵营",
    difficulty: "hard",
    specialEffect: "branchPaths",
    targetScore: 70,
    unlocked: false
  },
  {
    id: 8,
    levelNumber: 8,
    name: "粥铺晨光",
    description: "慢火熬制的粥，节奏要稳",
    difficulty: "hard",
    specialEffect: "slowMovingPlatforms",
    targetScore: 80,
    unlocked: false
  },
  {
    id: 9,
    levelNumber: 9,
    name: "馄饨捞面",
    description: "滑溜溜的面条，跳跃要小心",
    difficulty: "hard",
    specialEffect: "slipperyPlatforms",
    targetScore: 90,
    unlocked: false
  },
  {
    id: 10,
    levelNumber: 10,
    name: "早餐之王",
    description: "汇集所有早餐，挑战终极早餐组合",
    difficulty: "boss",
    specialEffect: "combinedElements",
    targetScore: 100,
    unlocked: false
  }
];

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  for (const user of db.users.values()) {
    if (user.username === username) {
      return res.status(400).json({ error: '用户名已存在' });
    }
  }
  const userId = db.nextUserId++;
  const user = { id: userId, username, password, createdAt: new Date().toISOString() };
  db.users.set(userId, user);
  
  // 初始化用户进度
  db.userProgress.set(userId, {
    userId,
    currentChapter: 1,
    currentLevel: 1,
    unlockedChapters: [1],
    unlockedLevels: {
      1: [1]
    },
    scores: {},
    totalScore: 0,
    achievements: []
  });
  
  res.json({ success: true, user: { id: userId, username } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  for (const user of db.users.values()) {
    if (user.username === username && user.password === password) {
      return res.json({ success: true, user: { id: user.id, username: user.username } });
    }
  }
  res.status(401).json({ error: '用户名或密码错误' });
});

app.post('/api/score', (req, res) => {
  const { userId, username, score, level, chapter } = req.body;
  if (!score || score < 0) {
    return res.status(400).json({ error: '无效的分数' });
  }
  const record = {
    id: db.scores.length + 1,
    userId: userId || 0,
    username: username || '匿名玩家',
    score,
    level: level || 1,
    chapter: chapter || 1,
    timestamp: new Date().toISOString()
  };
  db.scores.push(record);
  db.scores.sort((a, b) => b.score - a.score);
  
  // 更新用户进度
  if (userId) {
    const progress = db.userProgress.get(userId) || {
      userId,
      currentChapter: 1,
      currentLevel: 1,
      unlockedChapters: [1],
      unlockedLevels: { 1: [1] },
      scores: {},
      totalScore: 0,
      achievements: []
    };
    
    // 保存关卡分数
    if (!progress.scores[chapter]) {
      progress.scores[chapter] = {};
    }
    progress.scores[chapter][level] = Math.max(progress.scores[chapter][level] || 0, score);
    
    // 更新总分数
    progress.totalScore = calculateTotalScore(progress.scores);
    
    // 解锁下一关卡
    if (level < 10 && score >= chapter1Levels[level - 1].targetScore) {
      if (!progress.unlockedLevels[chapter]) {
        progress.unlockedLevels[chapter] = [];
      }
      if (!progress.unlockedLevels[chapter].includes(level + 1)) {
        progress.unlockedLevels[chapter].push(level + 1);
        progress.unlockedLevels[chapter].sort((a, b) => a - b);
      }
    }
    
    // 解锁下一章（第一章解锁条件：累计获得1000分）
    if (chapter === 1 && level === 10 && progress.totalScore >= 1000 && !progress.unlockedChapters.includes(2)) {
      progress.unlockedChapters.push(2);
      progress.unlockedChapters.sort((a, b) => a - b);
      progress.unlockedLevels[2] = [1];
    }
    
    db.userProgress.set(userId, progress);
  }
  
  res.json({ success: true, rank: db.scores.findIndex(s => s.id === record.id) + 1 });
});

function calculateTotalScore(scores) {
  let total = 0;
  for (const chapter in scores) {
    for (const level in scores[chapter]) {
      total += scores[chapter][level];
    }
  }
  return total;
}

app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const topScores = db.scores.slice(0, limit);
  res.json({ success: true, scores: topScores });
});

app.get('/api/user/:userId/scores', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userScores = db.scores.filter(s => s.userId === userId);
  res.json({ success: true, scores: userScores });
});

app.get('/api/user/:userId/progress', (req, res) => {
  const userId = parseInt(req.params.userId);
  const progress = db.userProgress.get(userId);
  if (!progress) {
    return res.json({ 
      success: true, 
      progress: {
        userId,
        currentChapter: 1,
        currentLevel: 1,
        unlockedChapters: [1],
        unlockedLevels: { 1: [1] },
        scores: {},
        totalScore: 0,
        achievements: []
      }
    });
  }
  res.json({ success: true, progress });
});

app.get('/api/game/levels', (req, res) => {
  const chapter = parseInt(req.query.chapter) || 1;
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  
  let levels;
  if (chapter === 1) {
    levels = chapter1Levels.map(level => {
      let unlocked = level.unlocked;
      if (userId) {
        const progress = db.userProgress.get(userId);
        if (progress && progress.unlockedLevels[chapter]) {
          unlocked = progress.unlockedLevels[chapter].includes(level.levelNumber);
        }
      }
      return { ...level, unlocked };
    });
  } else {
    levels = [
      { id: 1, levelNumber: 1, name: "外卖小哥", description: "跟随外卖小哥，穿梭写字楼", difficulty: "medium", specialEffect: "deliveryBoxPlatforms", targetScore: 20, unlocked: false }
    ];
  }
  
  res.json({ success: true, levels });
});

app.get('/api/game/level/:levelId/details', (req, res) => {
  const levelId = parseInt(req.params.levelId);
  const chapter = Math.floor((levelId - 1) / 10) + 1;
  const levelNumber = levelId % 10 === 0 ? 10 : levelId % 10;
  
  if (chapter === 1) {
    const level = chapter1Levels[levelNumber - 1];
    if (!level) {
      return res.status(404).json({ error: '关卡不存在' });
    }
    
    res.json({ 
      success: true, 
      level: {
        ...level,
        chapter,
        obstacles: generateLevelObstacles(level.specialEffect),
        platforms: generateLevelPlatforms(level.specialEffect)
      }
    });
  } else {
    res.json({ 
      success: true, 
      level: {
        id: levelId,
        chapter,
        levelNumber,
        name: "待开发关卡",
        description: "后续章节正在开发中",
        difficulty: "medium",
        specialEffect: "default",
        targetScore: 50,
        obstacles: [],
        platforms: []
      }
    });
  }
});

function generateLevelObstacles(specialEffect) {
  const obstacles = [];
  
  switch(specialEffect) {
    case 'movingYoutiaoObstacles':
      obstacles.push({
        type: 'youtiao',
        x: 200,
        y: 400,
        width: 60,
        height: 15,
        speed: 2,
        direction: 1,
        minX: 100,
        maxX: 300
      });
      break;
    case 'steamObstacles':
      obstacles.push({
        type: 'steam',
        x: 250,
        y: 350,
        radius: 30,
        duration: 3000,
        active: true
      });
      break;
    case 'slipperyPlatforms':
      obstacles.push({
        type: 'slippery',
        x: 200,
        y: 500,
        width: 80,
        height: 20
      });
      break;
  }
  
  return obstacles;
}

function generateLevelPlatforms(specialEffect) {
  const platforms = [];
  
  switch(specialEffect) {
    case 'tofuPlatforms':
      platforms.push({
        x: 150,
        y: 600,
        width: 60,
        height: 15,
        type: 'tofu',
        food: '🥛'
      });
      platforms.push({
        x: 280,
        y: 550,
        width: 60,
        height: 15,
        type: 'tofu',
        food: '🥛'
      });
      break;
    case 'sizeVariationPlatforms':
      platforms.push({
        x: 100,
        y: 600,
        width: 90,
        height: 20,
        type: 'baozi',
        food: '🥟'
      });
      platforms.push({
        x: 250,
        y: 520,
        width: 40,
        height: 15,
        type: 'baozi',
        food: '🥟'
      });
      break;
    default:
      platforms.push({
        x: 150,
        y: 600,
        width: 70,
        height: 20,
        type: 'normal',
        food: '🍜'
      });
      platforms.push({
        x: 280,
        y: 550,
        width: 70,
        height: 20,
        type: 'normal',
        food: '🍜'
      });
  }
  
  return platforms;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});