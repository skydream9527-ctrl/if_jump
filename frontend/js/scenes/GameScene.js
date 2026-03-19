/**
 * 游戏场景
 */
class GameScene extends Scene {
  constructor() {
    super('game-screen');
    this.api = new APIService();
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.isCharging = false;
    this.power = 0;
    this.maxPower = 100;
    this.character = {
      x: 0,
      y: 0,
      radius: 20,
      vy: 0,
      vx: 0,
      isJumping: false,
      rotation: 0
    };
    this.platforms = [];
    this.obstacles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.currentPlatformIndex = 0;
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.combo = 0;
    this.animationId = null;
    this.lastTime = 0;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  async init(data = {}) {
    super.init(data);
    this.levelId = data.levelId;
    this.levelNumber = data.levelNumber;
    await this.loadLevelDetails();
    this.startGame();
  }

  async loadLevelDetails() {
    const result = await this.api.getLevelDetails(this.levelId);
    if (result.success) {
      this.currentLevelDetails = result.level;
    }
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.combo = 0;
    this.updateScoreDisplay();
    this.updateLevelDisplay();

    this.platforms = [];
    this.obstacles = [];
    this.createLevelPlatforms();
    this.createLevelObstacles();

    this.character.x = this.platforms[0].x + this.platforms[0].width / 2;
    this.character.y = this.platforms[0].y - this.character.radius;
    this.character.vy = 0;
    this.character.vx = 0;
    this.character.isJumping = false;

    this.currentPlatformIndex = 0;
    this.cameraY = 0;
    this.targetCameraY = 0;

    this.bindGameEvents();
    this.lastTime = performance.now();
    this.gameLoop();
  }

  createLevelPlatforms() {
    // 根据关卡特效创建不同的平台
    switch (this.currentLevelDetails.specialEffect) {
      case 'tofuPlatforms':
        this.platforms.push({
          x: 100,
          y: 600,
          width: 80,
          height: 15,
          type: 'tofu',
          food: '🥛',
          color: '#FFB347'
        });
        this.platforms.push({
          x: 250,
          y: 520,
          width: 80,
          height: 15,
          type: 'tofu',
          food: '🥛',
          color: '#FFB347'
        });
        break;
      case 'sizeVariationPlatforms':
        this.platforms.push({
          x: 100,
          y: 600,
          width: 90,
          height: 20,
          type: 'baozi',
          food: '🥟',
          color: '#FFB347'
        });
        this.platforms.push({
          x: 250,
          y: 520,
          width: 40,
          height: 15,
          type: 'baozi',
          food: '🥟',
          color: '#FFB347'
        });
        this.platforms.push({
          x: 350,
          y: 480,
          width: 70,
          height: 18,
          type: 'baozi',
          food: '🥟',
          color: '#FFB347'
        });
        break;
      default:
        this.platforms.push({
          x: 150,
          y: 600,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜',
          color: '#FFB347'
        });
        this.platforms.push({
          x: 280,
          y: 550,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜',
          color: '#FFB347'
        });
    }

    // 添加更多随机平台
    for (let i = this.platforms.length; i < 15; i++) {
      this.addRandomPlatform();
    }
  }

  createLevelObstacles() {
    switch (this.currentLevelDetails.specialEffect) {
      case 'movingYoutiaoObstacles':
        this.obstacles.push({
          id: 'youtiao1',
          type: 'youtiao',
          x: 200,
          y: 400,
          width: 60,
          height: 15,
          speed: 2,
          direction: 1,
          minX: 100,
          maxX: 300,
          active: true
        });
        break;
      case 'steamObstacles':
        this.obstacles.push({
          id: 'steam1',
          type: 'steam',
          x: 250,
          y: 350,
          radius: 30,
          duration: 3000,
          active: true,
          startTime: Date.now()
        });
        break;
    }
  }

  addRandomPlatform() {
    const lastPlatform = this.platforms[this.platforms.length - 1];
    const minGap = 80;
    const maxGap = 150;
    const gap = minGap + Math.random() * (maxGap - minGap);

    const minWidth = 40;
    const maxWidth = 80;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const angle = (Math.random() - 0.5) * 0.5;
    const newX = lastPlatform.x + (lastPlatform.width / 2) + gap * Math.cos(angle) - width / 2;
    const newY = lastPlatform.y - gap * Math.sin(angle) - Math.random() * 50;

    const foodEmojis = ['🥛', '🍜', '🥟', '🥐', '🍳'];
    const types = ['normal', 'tofu', 'baozi'];

    this.platforms.push({
      x: Math.max(20, Math.min(this.canvas.width - width - 20, newX)),
      y: Math.max(100, newY),
      width,
      height: 20,
      type: types[Math.floor(Math.random() * types.length)],
      food: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
  }

  bindGameEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startCharge(e));
    this.canvas.addEventListener('mouseup', (e) => this.jump(e));
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startCharge(e); });
    this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.jump(e); });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isPlaying && !this.isPaused) {
        this.isCharging = true;
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && this.isPlaying && !this.isPaused) {
        this.jump();
      }
    });

    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-quit').addEventListener('click', () => this.quitGame());
  }

  startCharge(e) {
    if (!this.isPlaying || this.isPaused || this.character.isJumping) return;
    this.isCharging = true;
    this.power = 0;
    this.chargeAnimationStartTime = performance.now();
  }

  jump() {
    if (!this.isPlaying || this.isPaused || !this.isCharging) return;
    this.isCharging = false;

    const jumpPower = (this.power / 100) * 15 + 8;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.1;

    this.character.vy = jumpPower * Math.sin(angle);
    this.character.vx = jumpPower * Math.cos(angle);
    this.character.isJumping = true;
    this.character.rotation = 0;
    this.jumpStartTime = performance.now();
  }

  update(deltaTime) {
    if (this.isCharging) {
      this.power = Math.min(this.maxPower, this.power + deltaTime * 0.15);
      document.getElementById('power-bar').style.width = `${this.power}%`;
      if (Math.random() < 0.1) {
        this.createParticles(this.character.x, this.character.y, 1, 'charge');
      }
    }

    this.updateParticles(deltaTime);

    if (this.character.isJumping) {
      this.character.vy += 0.5;
      this.character.x += this.character.vx * deltaTime * 0.05;
      this.character.y += this.character.vy * deltaTime * 0.05;
      this.character.rotation += deltaTime * 0.1;

      if (this.character.y > this.canvas.height + 200) {
        this.gameOver();
        return;
      }

      for (let i = this.currentPlatformIndex; i < this.platforms.length; i++) {
        const platform = this.platforms[i];
        if (this.checkCollision(platform)) {
          this.landOnPlatform(platform, i);
          break;
        }
      }
    }

    this.updateObstacles(deltaTime);
    this.targetCameraY = this.character.y - this.canvas.height * 0.6;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.1;

    while (this.platforms.length > 20) {
      this.platforms.shift();
      this.currentPlatformIndex--;
    }

    const lastPlatform = this.platforms[this.platforms.length - 1];
    if (lastPlatform.y > this.cameraY - 200) {
      this.addPlatform();
    }
  }

  updateObstacles(deltaTime) {
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'youtiao') {
        obstacle.x += obstacle.speed * obstacle.direction;
        if (obstacle.x <= obstacle.minX || obstacle.x >= obstacle.maxX) {
          obstacle.direction *= -1;
        }
      } else if (obstacle.type === 'steam') {
        const elapsed = Date.now() - obstacle.startTime;
        const phase = (elapsed % obstacle.duration) / obstacle.duration;
        obstacle.active = phase < 0.5;
      }

      if (obstacle.active && this.checkObstacleCollision(obstacle)) {
        this.handleObstacleCollision(obstacle);
      }
    });
  }

  checkObstacleCollision(obstacle) {
    if (!this.character.isJumping) return false;

    const charCenterX = this.character.x;
    const charCenterY = this.character.y;

    if (obstacle.type === 'youtiao') {
      return charCenterX > obstacle.x && 
             charCenterX < obstacle.x + obstacle.width && 
             charCenterY > obstacle.y && 
             charCenterY < obstacle.y + obstacle.height;
    } else if (obstacle.type === 'steam') {
      const dx = charCenterX - obstacle.x;
      const dy = charCenterY - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < obstacle.radius;
    }

    return false;
  }

  handleObstacleCollision(obstacle) {
    if (obstacle.type === 'steam') {
      this.character.vy *= 1.1;
    }
  }

  checkCollision(platform) {
    if (this.character.vy <= 0) return false;

    const charBottom = this.character.y + this.character.radius;
    const charPrevBottom = charBottom - this.character.vy;

    if (charPrevBottom <= platform.y && charBottom >= platform.y) {
      if (this.character.x >= platform.x && this.character.x <= platform.x + platform.width) {
        return true;
      }
    }
    return false;
  }

  landOnPlatform(platform, index) {
    this.character.y = platform.y - this.character.radius;
    this.character.vy = 0;
    this.character.vx = 0;
    this.character.isJumping = false;
    this.character.rotation = 0;

    const centerX = platform.x + platform.width / 2;
    const distance = Math.abs(this.character.x - centerX);
    const centerThreshold = platform.width * 0.2;

    this.currentPlatformIndex = index;

    if (distance < centerThreshold) {
      this.score += 2;
      this.combo++;
      this.showFloatingText('完美! +2', this.character.x, this.character.y - 40, '#FFD700');
      this.createParticles(this.character.x, this.character.y, 8, 'perfect');
    } else {
      this.score += 1;
      this.combo = 0;
      this.showFloatingText('+1', this.character.x, this.character.y - 40, '#fff');
      this.createParticles(this.character.x, this.character.y, 4, 'normal');
    }

    if (this.combo > 1) {
      this.score += Math.min(this.combo - 1, 5);
      this.showFloatingText(`连击 x${this.combo}!`, this.character.x, this.character.y - 60, '#FF6B6B');
    }

    this.updateScoreDisplay();

    if (this.score >= this.currentLevelDetails.targetScore) {
      this.levelComplete();
    }
  }

  updateScoreDisplay() {
    document.getElementById('current-score').textContent = this.score;
  }

  updateLevelDisplay() {
    const levelNames = ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章', '第七章', '第八章', '第九章', '第十章'];
    document.getElementById('current-level').textContent = levelNames[this.level - 1] || '第一章';
  }

  showFloatingText(text, x, y, color) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -2
    });
  }

  createParticles(x, y, count, type = 'default') {
    for (let i = 0; i < count; i++) {
      let particle = this.createParticle(x, y, type);
      this.particles.push(particle);
    }
  }

  createParticle(x, y, type) {
    let particle = {
      x: x,
      y: y,
      lifetime: 0,
      maxLifetime: 500 + Math.random() * 500,
      speed: 2 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      color: '#FFFFFF',
      size: 2 + Math.random() * 3
    };

    switch (type) {
      case 'charge':
        particle.color = ['#FFFFFF', '#FFD700', '#FFA500'][Math.floor(Math.random() * 3)];
        particle.speed = 1 + Math.random() * 2;
        particle.angle = Math.random() * Math.PI * 2;
        particle.maxLifetime = 300 + Math.random() * 200;
        break;
      case 'perfect':
        particle.color = '#FFD700';
        particle.speed = 3 + Math.random() * 4;
        particle.angle = Math.random() * Math.PI * 2;
        particle.size = 4 + Math.random() * 6;
        particle.maxLifetime = 600 + Math.random() * 300;
        break;
      case 'normal':
        particle.color = '#FFFFFF';
        particle.speed = 2 + Math.random() * 3;
        particle.angle = Math.random() * Math.PI * 2;
        particle.maxLifetime = 400 + Math.random() * 300;
        break;
    }

    return particle;
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.lifetime += deltaTime;
      if (particle.lifetime >= particle.maxLifetime) {
        return false;
      }

      particle.x += Math.cos(particle.angle) * particle.speed * deltaTime * 0.01;
      particle.y += Math.sin(particle.angle) * particle.speed * deltaTime * 0.01;
      particle.y += 0.5 * deltaTime * 0.01;

      const alpha = 1 - (particle.lifetime / particle.maxLifetime);
      particle.color = this.adjustAlpha(particle.color, alpha);

      return true;
    });
  }

  adjustAlpha(color, alpha) {
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = 255;
      g = 255;
      b = 255;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  render(ctx) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(0, -this.cameraY);

    this.platforms.forEach((platform, i) => {
      this.ctx.fillStyle = platform.color;
      this.ctx.beginPath();
      this.roundRect(platform.x, platform.y, platform.width, platform.height, 8);
      this.ctx.fill();

      if (!platform.isStart && platform.food) {
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(platform.food, platform.x + platform.width / 2, platform.y - 5);
      }

      if (i === this.currentPlatformIndex) {
        const centerX = platform.x + platform.width / 2;
        const gradient = this.ctx.createRadialGradient(centerX, platform.y, 0, centerX, platform.y, platform.width / 2);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, platform.y, platform.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    this.obstacles.forEach(obstacle => {
      if (obstacle.active) {
        if (obstacle.type === 'youtiao') {
          this.ctx.fillStyle = '#FFD700';
          this.ctx.beginPath();
          this.ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 3);
          this.ctx.fill();
          this.ctx.fillStyle = '#8B4513';
          this.ctx.beginPath();
          this.ctx.roundRect(obstacle.x + 5, obstacle.y + 3, obstacle.width - 10, obstacle.height - 6, 2);
          this.ctx.fill();
        } else if (obstacle.type === 'steam') {
          const gradient = this.ctx.createRadialGradient(obstacle.x, obstacle.y, 0, obstacle.x, obstacle.y, obstacle.radius);
          gradient.addColorStop(0, 'rgba(200, 200, 200, 0.6)');
          gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });

    this.ctx.save();
    this.ctx.translate(this.character.x, this.character.y);
    this.ctx.rotate(this.character.rotation);

    let scale = 1.0;
    if (this.isCharging) {
      const chargeProgress = Math.min(this.power / 100, 1);
      scale = 1.0 - chargeProgress * 0.15;
    } else if (this.character.isJumping) {
      const jumpTime = (performance.now() - this.jumpStartTime) / 300;
      if (jumpTime < 0.3) {
        scale = 1.0 + Math.sin(jumpTime * Math.PI) * 0.15;
      }
    }

    this.ctx.scale(scale, scale);

    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.character.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(-5, -5, 5, 0, Math.PI * 2);
    this.ctx.arc(5, -5, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(-5, -5, 2, 0, Math.PI * 2);
    this.ctx.arc(5, -5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    if (this.isCharging) {
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 2, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      this.ctx.stroke();
    } else if (this.character.isJumping) {
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 6, 0.5 * Math.PI, 1.5 * Math.PI);
      this.ctx.stroke();
    } else {
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 8, 0.2 * Math.PI, 0.8 * Math.PI);
      this.ctx.stroke();
    }

    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🍜', 0, 5);

    this.ctx.restore();

    this.drawParticles();

    this.floatingTexts = this.floatingTexts.filter(ft => {
      ft.y += ft.vy;
      ft.alpha -= 0.02;

      if (ft.alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = ft.alpha;
        this.ctx.fillStyle = ft.color;
        this.ctx.font = 'bold 16px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(ft.text, ft.x, ft.y);
        this.ctx.restore();
        return true;
      }
      return false;
    });

    this.ctx.restore();
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  gameLoop() {
    if (!this.isPlaying || this.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render(this.ctx);

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  levelComplete() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);

    if (window.gameState.currentUser) {
      this.api.submitScore(
        window.gameState.currentUser.id,
        window.gameState.currentUser.username,
        this.score,
        this.levelNumber,
        1
      ).then(result => {
        if (result.success) {
          console.log('分数提交成功');
        }
      });
    }

    this.engine.goToScene('level-complete', { score: this.score, levelNumber: this.levelNumber });
  }

  gameOver() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);

    this.engine.goToScene('game-over', { score: this.score, levelNumber: this.levelNumber });
  }

  pauseGame() {
    this.isPaused = true;
    document.getElementById('pause-modal').classList.add('active');
  }

  resumeGame() {
    this.isPaused = false;
    document.getElementById('pause-modal').classList.remove('active');
    this.lastTime = performance.now();
    this.gameLoop();
  }

  quitGame() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);
    this.engine.goToScene('level-select');
  }

  bindEvents() {
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit-pause').addEventListener('click', () => this.quitGame());
  }

  unbindEvents() {
    // 解绑事件
  }
}