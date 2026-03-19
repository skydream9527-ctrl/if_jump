/**
 * 场景管理器 - 负责管理不同游戏场景之间的切换
 */
class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * 注册场景
   * @param {string} name - 场景名称
   * @param {Scene} scene - 场景实例
   */
  registerScene(name, scene) {
    this.scenes.set(name, scene);
    scene.engine = this;
  }

  /**
   * 切换到指定场景
   * @param {string} name - 场景名称
   * @param {Object} data - 传递给场景的数据
   */
  goToScene(name, data = {}) {
    if (!this.scenes.has(name)) {
      console.error(`场景 ${name} 不存在`);
      return;
    }

    // 销毁当前场景
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    // 设置新场景
    this.currentScene = this.scenes.get(name);
    this.currentScene.init(data);
    this.currentScene.show();
  }

  /**
   * 获取当前场景
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * 更新当前场景
   */
  update(deltaTime) {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * 渲染当前场景
   */
  render() {
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
    }
  }

  /**
   * 处理输入事件
   */
  handleInput(event) {
    if (this.currentScene) {
      this.currentScene.handleInput(event);
    }
  }
}