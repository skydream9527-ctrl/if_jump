/**
 * GameEngine.js
 * 核心游戏引擎，管理游戏循环、状态和系统
 */

class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scenes = {};
    this.currentState = null;
    this.isRunning = false;
    this.lastTime = 0;
    this.systems = [];
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // 初始化输入系统
    this.inputSystem = new InputSystem(this.canvas);
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  addScene(name, scene) {
    this.scenes[name] = scene;
    scene.engine = this;
  }

  switchScene(sceneName) {
    if (this.currentState) {
      this.currentState.deactivate();
    }
    
    this.currentState = this.scenes[sceneName];
    if (this.currentState) {
      this.currentState.activate();
    }
  }

  addSystem(system) {
    this.systems.push(system);
    system.engine = this;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    // 更新系统
    this.systems.forEach(system => {
      if (typeof system.update === 'function') {
        system.update(deltaTime);
      }
    });

    // 更新当前场景
    if (this.currentState && typeof this.currentState.update === 'function') {
      this.currentState.update(deltaTime);
    }

    // 渲染
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染系统
    this.systems.forEach(system => {
      if (typeof system.render === 'function') {
        system.render(this.ctx);
      }
    });

    // 渲染当前场景
    if (this.currentState && typeof this.currentState.render === 'function') {
      this.currentState.render(this.ctx);
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}