/**
 * API扩展模块 - 提供更多游戏功能
 */
const express = require('express');
const router = express.Router();

// 扩展API功能
// 1. 多章节支持
router.get('/chapters', (req, res) => {
  const chapters = [
    {
      id: 1,
      name: '早餐时光',
      description: '开启美食之旅的第一站',
      levels: 10,
      unlocked: true,
      completed: req.query.userId ? getUserCompletedLevels(req.query.userId, 1) : 0
    },
    {
      id: 2,
      name: '午餐盛宴',
      description: '午间美食探索',
      levels: 10,
      unlocked: false,
      completed: 0
    },
    {
      id: 3,
      name: '晚餐浪漫',
      description: '夜晚的美食冒险',
      levels: 10,
      unlocked: false,
      completed: 0
    }
  ];
  
  res.json({ success: true, chapters });
});

// 2. 自定义关卡API
router.post('/custom-levels', (req, res) => {
  const { userId, levelData } = req.body;
  
  // 验证用户权限
  if (!userId || !levelData) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 保存自定义关卡
  const customLevel = {
    id: generateId(),
    userId,
    name: levelData.name,
    description: levelData.description,
    config: levelData.config,
    createdAt: new Date().toISOString(),
    likes: 0,
    plays: 0
  };
  
  saveCustomLevel(customLevel);
  
  res.json({ success: true, level: customLevel });
});

// 3. 成就系统API
router.get('/achievements/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userAchievements = getUserAchievements(userId);
  
  res.json({ 
    success: true, 
    achievements: userAchievements,
    unlocked: userAchievements.filter(a => a.unlocked),
    progress: calculateAchievementProgress(userAchievements)
  });
});

// 4. 社交功能API
router.get('/friends/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const friends = getUserFriends(userId);
  
  res.json({ success: true, friends });
});

router.post('/friends/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;
  
  addFriend(parseInt(userId), parseInt(friendId));
  
  res.json({ success: true });
});

// 5. 排行榜扩展
router.get('/leaderboard/global', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const globalLeaderboard = getGlobalLeaderboard(limit, offset);
  
  res.json({ success: true, leaderboard: globalLeaderboard });
});

router.get('/leaderboard/friends/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const friendsLeaderboard = getFriendsLeaderboard(userId);
  
  res.json({ success: true, leaderboard: friendsLeaderboard });
});

// 6. 商店/道具系统API
router.get('/shop/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userCoins = getUserCoins(userId);
  const shopItems = getShopItems();
  const ownedItems = getUserOwnedItems(userId);
  
  res.json({ 
    success: true, 
    coins: userCoins,
    items: shopItems,
    owned: ownedItems
  });
});

router.post('/shop/buy', (req, res) => {
  const { userId, itemId } = req.body;
  const purchaseResult = processPurchase(userId, itemId);
  
  res.json({ success: true, result: purchaseResult });
});

module.exports = router;

// 辅助函数（示例）
function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

function getUserCompletedLevels(userId, chapter) {
  // 实现获取用户完成的关卡数量
  return 0;
}

function saveCustomLevel(level) {
  // 实现保存自定义关卡
}

function getUserAchievements(userId) {
  // 实现获取用户成就
  return [];
}

function calculateAchievementProgress(achievements) {
  // 实现计算成就进度
  return { total: 0, unlocked: 0, percentage: 0 };
}

function getUserFriends(userId) {
  // 实现获取用户好友列表
  return [];
}

function addFriend(userId, friendId) {
  // 实现添加好友
}

function getGlobalLeaderboard(limit, offset) {
  // 实现全局排行榜
  return [];
}

function getFriendsLeaderboard(userId) {
  // 实现好友排行榜
  return [];
}

function getUserCoins(userId) {
  // 实现获取用户金币
  return 0;
}

function getShopItems() {
  // 实现获取商店物品
  return [];
}

function getUserOwnedItems(userId) {
  // 实现获取用户拥有的物品
  return [];
}

function processPurchase(userId, itemId) {
  // 实现购买处理
  return { success: true };
}