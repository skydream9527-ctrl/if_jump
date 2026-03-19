/**
 * 主应用入口
 */
class GameApp {
  constructor() {
    this.sceneManager = new SceneManager();
    this.gameState = new GameState();
    window.gameState = this.gameState; // 全局访问
    this.init();
  }

  init() {
    // 注册所有场景
    this.sceneManager.registerScene('start', new StartScene());
    this.sceneManager.registerScene('level-select', new LevelSelectScene());
    this.sceneManager.registerScene('game', new GameScene());

    // 启动开始场景
    this.sceneManager.goToScene('start');
  }

  // 全局更新循环
  run() {
    const loop = () => {
      const deltaTime = 16; // 约60fps
      this.sceneManager.update(deltaTime);
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
  window.gameApp.run();
});