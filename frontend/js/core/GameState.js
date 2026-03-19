/**
 * 游戏状态管理器 - 管理全局游戏状态
 */
class GameState {
  constructor() {
    this.currentUser = null;
    this.currentLevel = 1;
    this.currentChapter = 1;
    this.score = 0;
    this.coins = 0;
    this.achievements = [];
    this.settings = {
      musicVolume: 1.0,
      soundVolume: 1.0,
      language: 'zh-CN',
      theme: 'default'
    };
    this.userProgress = {
      unlockedLevels: { 1: [1] }, // 章节: [关卡列表]
      unlockedChapters: [1],
      completedLevels: [],
      scores: {}
    };
  }

  /**
   * 设置当前用户
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 更新分数
   */
  updateScore(points) {
    this.score += points;
    return this.score;
  }

  /**
   * 获取当前分数
   */
  getScore() {
    return this.score;
  }

  /**
   * 解锁关卡
   */
  unlockLevel(chapter, level) {
    if (!this.userProgress.unlockedLevels[chapter]) {
      this.userProgress.unlockedLevels[chapter] = [];
    }
    if (!this.userProgress.unlockedLevels[chapter].includes(level)) {
      this.userProgress.unlockedLevels[chapter].push(level);
      this.userProgress.unlockedLevels[chapter].sort((a, b) => a - b);
    }
  }

  /**
   * 解锁章节
   */
  unlockChapter(chapter) {
    if (!this.userProgress.unlockedChapters.includes(chapter)) {
      this.userProgress.unlockedChapters.push(chapter);
      this.userProgress.unlockedChapters.sort((a, b) => a - b);
    }
  }

  /**
   * 完成关卡
   */
  completeLevel(chapter, level) {
    const levelKey = `${chapter}-${level}`;
    if (!this.userProgress.completedLevels.includes(levelKey)) {
      this.userProgress.completedLevels.push(levelKey);
    }
  }

  /**
   * 保存游戏进度到本地存储
   */
  saveProgress() {
    if (this.currentUser) {
      localStorage.setItem(`user_progress_${this.currentUser.id}`, JSON.stringify(this.userProgress));
      localStorage.setItem(`user_settings_${this.currentUser.id}`, JSON.stringify(this.settings));
    }
  }

  /**
   * 从本地存储加载游戏进度
   */
  loadProgress() {
    if (this.currentUser) {
      const savedProgress = localStorage.getItem(`user_progress_${this.currentUser.id}`);
      const savedSettings = localStorage.getItem(`user_settings_${this.currentUser.id}`);
      
      if (savedProgress) {
        this.userProgress = { ...this.userProgress, ...JSON.parse(savedProgress) };
      }
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    }
  }

  /**
   * 重置游戏状态
   */
  reset() {
    this.score = 0;
    this.coins = 0;
    this.currentLevel = 1;
    this.currentChapter = 1;
    this.achievements = [];
  }
}