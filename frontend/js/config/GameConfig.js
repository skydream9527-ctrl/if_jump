/**
 * 游戏配置文件
 */
const GameConfig = {
  // 游戏基本设置
  GAME: {
    NAME: '吃了么 - 跳一跳美食游戏',
    VERSION: '2.0.0',
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 800,
    TARGET_FPS: 60,
    GRAVITY: 0.5
  },

  // 玩家设置
  PLAYER: {
    RADIUS: 20,
    MAX_JUMP_POWER: 23,
    MIN_JUMP_POWER: 8,
    JUMP_CHARGE_RATE: 0.15,
    MAX_CHARGE: 100
  },

  // 平台设置
  PLATFORM: {
    MIN_WIDTH: 40,
    MAX_WIDTH: 80,
    HEIGHT: 20,
    MIN_GAP: 80,
    MAX_GAP: 200
  },

  // 关卡设置
  LEVEL: {
    PLATFORM_COUNT: 15,
    TARGET_SCORE_MULTIPLIER: 10
  },

  // 视觉效果设置
  VISUAL: {
    PARTICLE_COUNT: {
      CHARGE: 1,
      PERFECT_LANDING: 8,
      NORMAL_LANDING: 4
    },
    CAMERA_FOLLOW_SPEED: 0.1,
    CAMERA_OFFSET: 0.6 // 屏幕比例
  },

  // 音效设置
  AUDIO: {
    ENABLED: true,
    VOLUME: 0.7
  },

  // UI设置
  UI: {
    POWER_BAR_HEIGHT: 20,
    POWER_BAR_WIDTH: 200
  },

  // 特效类型
  EFFECT_TYPES: {
    TOFU_PLATFORMS: 'tofuPlatforms',
    MOVING_YOUTIAO: 'movingYoutiaoObstacles',
    STEAM_OBSTACLES: 'steamObstacles',
    SIZE_VARIATION: 'sizeVariationPlatforms',
    SLIPPERY_PLATFORMS: 'slipperyPlatforms'
  },

  // 难度设置
  DIFFICULTY: {
    EASY: { multiplier: 1.0 },
    MEDIUM: { multiplier: 1.5 },
    HARD: { multiplier: 2.0 },
    BOSS: { multiplier: 2.5 }
  },

  // 成就系统配置
  ACHIEVEMENTS: {
    FIRST_WIN: { id: 'first_win', name: '首次胜利', desc: '完成第一关', points: 10 },
    PERFECT_LANDINGS: { id: 'perfect_lands', name: '完美着陆', desc: '连续完美着陆10次', points: 20 },
    HIGH_SCORE: { id: 'high_score', name: '高分达人', desc: '单局得分超过500', points: 30 },
    LEVEL_MASTER: { id: 'level_master', name: '关卡大师', desc: '完成所有关卡', points: 50 }
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameConfig;
}