class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.currentScreen = 'start-screen';
    this.currentUser = null;
    this.score = 0;
    this.level = 1;
    this.isPlaying = false;
    this.isPaused = false;
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
    this.currentPlatformIndex = 0;
    this.cameraY = 0;
    this.targetCameraY = 0;

    this.combo = 0;
    this.perfectLanding = false;

    this.foods = ['🍜', '🥟', '🍔', '🍕', '🍣', '🍩', '🍰', '🧁', '🥞', '🥐'];
    this.currentFood = this.foods[0];

    this.animationId = null;
    this.lastTime = 0;

    // 粒子系统
    this.particles = [];

    this.initEventListeners();
    // 加载章节1的关卡数据，但不立即显示关卡选择页面
    // 游戏开始时应该显示开始页面，用户点击"开始游戏"按钮后才会进入关卡选择页面
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  initEventListeners() {
    document.getElementById('btn-start').addEventListener('click', () => this.showLevelSelect());
    document.getElementById('btn-login').addEventListener('click', () => this.showAuthModal('login'));
    document.getElementById('btn-register').addEventListener('click', () => this.showAuthModal('register'));
    document.getElementById('btn-leaderboard').addEventListener('click', () => this.showLeaderboard());
    document.getElementById('btn-back-leaderboard').addEventListener('click', () => this.showScreen('start-screen'));
    document.getElementById('btn-back-levels').addEventListener('click', () => this.showScreen('start-screen'));
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-quit').addEventListener('click', () => this.quitGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit-pause').addEventListener('click', () => this.quitFromPause());
    
    // 游戏失败页面事件
    document.getElementById('btn-retry-game-over').addEventListener('click', () => this.startChapter1Level());
    document.getElementById('btn-next-level-game-over').addEventListener('click', () => this.nextLevel());
    document.getElementById('btn-back-to-levels-game-over').addEventListener('click', () => this.showLevelSelect());

    document.querySelector('.close-modal').addEventListener('click', () => this.hideAuthModal());
    document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuth(e));

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
  }

  async loadChapter1Levels() {
    const result = await API.getChapterLevels(1, this.currentUser?.id);
    if (result.success) {
      this.chapter1Levels = result.levels;
      this.updateLevelGrid();
      this.updateProgressDisplay();
    }
  }

  updateLevelGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = this.chapter1Levels.map(level => `
      <div class="level-card ${level.unlocked ? '' : 'locked'}" data-level="${level.id}" data-level-number="${level.levelNumber}">
        <div class="level-number">#${level.levelNumber}</div>
        <div class="level-icon">${this.getLevelIcon(level.levelNumber)}</div>
        <div class="level-name">${level.name}</div>
        <div class="level-desc">${level.description}</div>
        <div class="level-target">目标分数: ${level.targetScore}</div>
        ${!level.unlocked ? '<div class="lock-icon">🔒</div>' : ''}
      </div>
    `).join('');

    grid.querySelectorAll('.level-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedLevelId = parseInt(card.dataset.level);
        this.currentLevelNumber = parseInt(card.dataset.levelNumber);
        this.loadLevelDetails();
      });
    });

    grid.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const levelId = parseInt(card.dataset.level);
        const level = this.chapter1Levels.find(l => l.id === levelId);
        if (level) {
          this.showLevelInfo(level);
        }
      });

      card.addEventListener('mouseleave', () => {
        this.hideLevelInfo();
      });
    });
  }

  getLevelIcon(levelNumber) {
    const foodEmojis = ['🥛', '🍜', '🥟', '🥐', '🍳', '🥞', '🍖', '🍔', '🍕', '🍣'];
    return foodEmojis[(levelNumber - 1) % foodEmojis.length];
  }

  showLevelInfo(level) {
    const infoDiv = document.getElementById('level-info');
    infoDiv.innerHTML = `
      <h3>${level.name}</h3>
      <p>${level.description}</p>
      <p>难度: ${this.getDifficultyText(level.difficulty)}</p>
      <p>目标分数: ${level.targetScore}</p>
    `;
  }

  hideLevelInfo() {
    const infoDiv = document.getElementById('level-info');
    infoDiv.innerHTML = '<p>选择关卡开始游戏</p>';
  }

  getDifficultyText(difficulty) {
    const difficultyMap = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      boss: 'Boss'
    };
    return difficultyMap[difficulty] || '普通';
  }

  async loadLevelDetails() {
    const result = await API.getLevelDetails(this.selectedLevelId);
    if (result.success) {
      this.currentLevelDetails = result.level;
      this.startChapter1Level();
    }
  }

  async startChapter1Level() {
    this.showScreen('game-screen');
    this.isPlaying = true;
    this.score = 0;
    this.combo = 0;
    this.updateScoreDisplay();
    this.updateLevelDisplay();

    this.platforms = [];
    this.obstacles = [];

    // 创建特定关卡的平台和障碍物
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
          food: '🥛'
        });
        this.platforms.push({
          x: 250,
          y: 520,
          width: 80,
          height: 15,
          type: 'tofu',
          food: '🥛'
        });
        break;
      case 'movingYoutiaoObstacles':
        this.platforms.push({
          x: 120,
          y: 600,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜'
        });
        this.platforms.push({
          x: 280,
          y: 550,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜'
        });
        break;
      case 'sizeVariationPlatforms':
        this.platforms.push({
          x: 100,
          y: 600,
          width: 90,
          height: 20,
          type: 'baozi',
          food: '🥟'
        });
        this.platforms.push({
          x: 250,
          y: 520,
          width: 40,
          height: 15,
          type: 'baozi',
          food: '🥟'
        });
        this.platforms.push({
          x: 350,
          y: 480,
          width: 70,
          height: 18,
          type: 'baozi',
          food: '🥟'
        });
        break;
      case 'slipperyPlatforms':
        this.platforms.push({
          x: 150,
          y: 600,
          width: 60,
          height: 20,
          type: 'slippery',
          food: '🍜'
        });
        this.platforms.push({
          x: 280,
          y: 550,
          width: 60,
          height: 20,
          type: 'slippery',
          food: '🍜'
        });
        break;
      default:
        this.platforms.push({
          x: 150,
          y: 600,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜'
        });
        this.platforms.push({
          x: 280,
          y: 550,
          width: 70,
          height: 20,
          type: 'normal',
          food: '🍜'
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
      food: foodEmojis[Math.floor(Math.random() * foodEmojis.length)]
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    this.currentScreen = screenId;
  }

  showAuthModal(type) {
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('auth-title').textContent = type === 'login' ? '登录' : '注册';
    this.authType = type;
    document.getElementById('auth-error').textContent = '';
  }

  hideAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
  }

  async handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    try {
      const result = this.authType === 'login'
        ? await API.login(username, password)
        : await API.register(username, password);

      if (result.success) {
        this.currentUser = result.user;
        this.hideAuthModal();
        alert(this.authType === 'login' ? '登录成功！' : '注册成功！');
      } else {
        errorEl.textContent = result.error;
      }
    } catch (err) {
      errorEl.textContent = '网络错误，请稍后重试';
    }
  }

  async showLeaderboard() {
    this.showScreen('leaderboard-screen');
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '<div class="loading">加载中...</div>';

    try {
      const result = await API.getLeaderboard(20);
      if (result.success && result.scores.length > 0) {
        list.innerHTML = result.scores.map((s, i) => `
          <div class="leaderboard-item">
            <span class="rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'}">${i + 1}</span>
            <span class="player-name">${this.escapeHtml(s.username)}</span>
            <span class="player-score">${s.score}</span>
          </div>
        `).join('');
      } else {
        list.innerHTML = '<div class="loading">暂无数据</div>';
      }
    } catch (err) {
      list.innerHTML = '<div class="loading">加载失败</div>';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showLevelSelect() {
    this.showScreen('level-select-screen');
    this.loadChapter1Levels(); // 确保加载关卡数据
  }

  startGame() {
    this.showScreen('game-screen');
    this.isPlaying = true;
    this.score = 0;
    this.combo = 0;
    this.updateScoreDisplay();
    this.updateLevelDisplay();

    this.platforms = [];
    this.createInitialPlatforms();
    
    this.character.x = this.platforms[0].x + this.platforms[0].width / 2;
    this.character.y = this.platforms[0].y - this.character.radius;
    this.character.vy = 0;
    this.character.vx = 0;
    this.character.isJumping = false;

    this.currentPlatformIndex = 0;
    this.cameraY = 0;
    this.targetCameraY = 0;

    this.lastTime = performance.now();
    this.gameLoop();
  }

  createInitialPlatforms() {
    const startPlatform = {
      x: this.canvas.width / 2 - 40,
      y: this.canvas.height - 150,
      width: 80,
      height: 20,
      color: '#FFB347',
      isStart: true
    };
    this.platforms.push(startPlatform);

    for (let i = 0; i < 10; i++) {
      this.addPlatform();
    }
  }

  addPlatform() {
    const lastPlatform = this.platforms[this.platforms.length - 1];
    const minGap = 80;
    const maxGap = 200;
    const gap = minGap + Math.random() * (maxGap - minGap);

    const minWidth = 40;
    const maxWidth = 80;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const angle = (Math.random() - 0.5) * 0.5;
    const newX = lastPlatform.x + (lastPlatform.width / 2) + gap * Math.cos(angle) - width / 2;
    const newY = lastPlatform.y - gap * Math.sin(angle) - Math.random() * 50;

    const hue = (this.level * 30 + this.platforms.length * 10) % 360;
    const colors = [
      `hsl(${hue}, 70%, 60%)`,
      `hsl(${(hue + 30) % 360}, 70%, 65%)`,
      `hsl(${(hue + 60) % 360}, 70%, 55%)`
    ];

    this.platforms.push({
      x: Math.max(20, Math.min(this.canvas.width - width - 20, newX)),
      y: Math.max(100, newY),
      width,
      height: 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      food: this.foods[Math.floor(Math.random() * this.foods.length)]
    });
  }

  startCharge(e) {
    if (!this.isPlaying || this.isPaused || this.character.isJumping) return;
    this.isCharging = true;
    this.power = 0;
    // 开始蓄力动画
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
    // 记录跳跃开始时间，用于动画
    this.jumpStartTime = performance.now();
  }

  update(deltaTime) {
    if (this.isCharging) {
      this.power = Math.min(this.maxPower, this.power + deltaTime * 0.15);
      document.getElementById('power-bar').style.width = `${this.power}%`;
      // 蓄力时产生粒子效果
      if (Math.random() < 0.1) {
        this.createParticles(this.character.x, this.character.y, 1, 'charge');
      }
    }

    // 更新粒子系统
    this.updateParticles(deltaTime);

    if (this.character.isJumping) {
      this.character.vy += 0.5;
      this.character.x += this.character.vx * deltaTime * 0.05;
      this.character.y += this.character.vy * deltaTime * 0.05;
      this.character.rotation += deltaTime * 0.01;

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

    // 更新障碍物
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
        // 移动油条障碍物
        obstacle.x += obstacle.speed * obstacle.direction;
        if (obstacle.x <= obstacle.minX || obstacle.x >= obstacle.maxX) {
          obstacle.direction *= -1;
        }
      } else if (obstacle.type === 'steam') {
        // 蒸汽障碍物的闪烁效果
        const elapsed = Date.now() - obstacle.startTime;
        const phase = (elapsed % obstacle.duration) / obstacle.duration;
        obstacle.active = phase < 0.5; // 每3秒闪烁一次
      }

      // 检测障碍物碰撞
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
      // 蒸汽影响视野，但不直接碰撞
      this.character.vy *= 1.1; // 稍微增加下落速度
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
      // 完美着陆粒子效果
      this.createParticles(this.character.x, this.character.y, 8, 'perfect');
    } else {
      this.score += 1;
      this.combo = 0;
      this.showFloatingText('+1', this.character.x, this.character.y - 40, '#fff');
      // 普通着陆粒子效果
      this.createParticles(this.character.x, this.character.y, 4, 'normal');
    }

    if (this.combo > 1) {
      this.score += Math.min(this.combo - 1, 5);
      this.showFloatingText(`连击 x${this.combo}!`, this.character.x, this.character.y - 60, '#FF6B6B');
    }

    this.updateScoreDisplay();

    // 检查是否达到关卡目标分数
    if (this.score >= this.currentLevelDetails.targetScore) {
      this.levelComplete();
    }
  }

  // 删除重复的函数定义，保留上面正确的版本

  floatingTexts = [];

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

  // 粒子系统方法
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
      maxLifetime: 500 + Math.random() * 500, // 0.5-1秒
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

      // 更新位置
      particle.x += Math.cos(particle.angle) * particle.speed * deltaTime * 0.01;
      particle.y += Math.sin(particle.angle) * particle.speed * deltaTime * 0.01;

      // 重力
      particle.y += 0.5 * deltaTime * 0.01;

      // 渐变颜色
      const alpha = 1 - (particle.lifetime / particle.maxLifetime);
      particle.color = this.adjustAlpha(particle.color, alpha);

      return true;
    });
  }

  adjustAlpha(color, alpha) {
    // 解析颜色
    let r, g, b;
    if (color.startsWith('#')) {
      // 十六进制颜色
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      // 默认白色
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

  draw() {
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

    // 绘制障碍物
    this.obstacles.forEach(obstacle => {
      if (obstacle.active) {
        if (obstacle.type === 'youtiao') {
          // 绘制油条障碍物
          this.ctx.fillStyle = '#FFD700'; // 金黄色
          this.ctx.beginPath();
          this.ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 3);
          this.ctx.fill();
          this.ctx.fillStyle = '#8B4513'; // 棕色细节
          this.ctx.beginPath();
          this.ctx.roundRect(obstacle.x + 5, obstacle.y + 3, obstacle.width - 10, obstacle.height - 6, 2);
          this.ctx.fill();
        } else if (obstacle.type === 'steam') {
          // 绘制蒸汽障碍物
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

    // 根据状态调整角色大小
    let scale = 1.0;
    if (this.isCharging) {
      const chargeProgress = Math.min(this.power / 100, 1);
      scale = 1.0 - chargeProgress * 0.15; // 蓄力时缩小
    } else if (this.character.isJumping) {
      const jumpTime = (performance.now() - this.jumpStartTime) / 300; // 跳跃动画时长0.3秒
      if (jumpTime < 0.3) {
        scale = 1.0 + Math.sin(jumpTime * Math.PI) * 0.15; // 跳跃时先放大
      }
    }

    this.ctx.scale(scale, scale);

    // 角色身体
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.character.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 眼睛
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(-5, -5, 5, 0, Math.PI * 2);
    this.ctx.arc(5, -5, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // 眼珠
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(-5, -5, 2, 0, Math.PI * 2);
    this.ctx.arc(5, -5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 表情
    if (this.isCharging) {
      // 蓄力时紧张的表情
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 2, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      this.ctx.stroke();
    } else if (this.character.isJumping) {
      // 跳跃时期待的表情
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 6, 0.5 * Math.PI, 1.5 * Math.PI);
      this.ctx.stroke();
    } else {
      // 待机时微笑的表情
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 8, 0.2 * Math.PI, 0.8 * Math.PI);
      this.ctx.stroke();
    }

    // 食物
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentFood, 0, 5);

    this.ctx.restore();

    // 绘制粒子
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

  levelComplete() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);

    // 更新关卡完成页面的内容而不是重新设置innerHTML
    const completeScreen = document.getElementById('level-complete-screen');
    const titleElement = completeScreen.querySelector('h2');
    const infoElements = completeScreen.querySelectorAll('.complete-info p');
    const scoreElement = document.getElementById('complete-score');

    if (titleElement) {
      titleElement.textContent = '关卡完成!';
    }
    
    if (infoElements.length >= 2) {
      infoElements[0].textContent = `恭喜你完成了关卡 ${this.currentLevelNumber} - ${this.currentLevelDetails.name}`;
      infoElements[1].innerHTML = `最终得分: <span id="complete-score">${this.score}</span>`;
    } else if (scoreElement) {
      scoreElement.textContent = this.score;
    }

    // 提交分数到服务器
    if (this.currentUser) {
      API.submitScore(
        this.currentUser.id,
        this.currentUser.username,
        this.score,
        this.currentLevelNumber,
        1 // 第一章
      ).then(result => {
        if (result.success) {
          console.log('分数提交成功');
          // 更新用户进度
          API.getUserProgress(this.currentUser.id).then(res => {
            if (res.success) {
              this.userProgress = res.progress;
            }
          });
        }
      });
    }

    // 显示通关界面
    this.showScreen('level-complete-screen');
  }

  nextLevel() {
    const nextLevelIndex = this.chapter1Levels.findIndex(level => level.levelNumber === this.currentLevelNumber + 1);
    if (nextLevelIndex !== -1 && this.chapter1Levels[nextLevelIndex].unlocked) {
      this.selectedLevelId = this.chapter1Levels[nextLevelIndex].id;
      this.currentLevelNumber = this.currentLevelNumber + 1;
      this.loadLevelDetails();
    } else {
      // 章节完成
      alert('恭喜你完成了第一章！');
      this.showScreen('level-select-screen');
    }
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

  updateProgressDisplay() {
    // 计算进度
    const totalLevels = this.chapter1Levels.length;
    const completedLevels = this.chapter1Levels.filter(level => level.unlocked).length;
    const progress = Math.round((completedLevels / totalLevels) * 100);
    
    // 更新进度条
    const progressBar = document.getElementById('progress-bar');
    const completedLevelsEl = document.getElementById('completed-levels');
    const totalLevelsEl = document.getElementById('total-levels');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (completedLevelsEl) {
      completedLevelsEl.textContent = completedLevels;
    }
    if (totalLevelsEl) {
      totalLevelsEl.textContent = totalLevels;
    }
    
    // 计算并更新最高分和总得分
    this.updateStats();
  }

  updateStats() {
    if (!this.currentUser) {
      return;
    }
    
    API.getUserProgress(this.currentUser.id).then(result => {
      if (result.success && result.progress) {
        const maxScoreEl = document.getElementById('max-score');
        const totalScoreEl = document.getElementById('total-score');
        
        if (maxScoreEl && result.progress.maxScore) {
          maxScoreEl.textContent = result.progress.maxScore;
        }
        if (totalScoreEl && result.progress.totalScore) {
          totalScoreEl.textContent = result.progress.totalScore;
        }
      }
    });
  }

  gameLoop() {
    if (!this.isPlaying || this.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  async gameOver() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);

    // 显示游戏失败页面
    document.getElementById('game-over-score').textContent = this.score;
    document.getElementById('game-over-target').textContent = this.currentLevelDetails.targetScore;
    document.getElementById('game-over-level').textContent = `#${this.currentLevelNumber}`;

    this.showScreen('game-over-screen');
  }

  restart() {
    this.startGame();
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
    this.showScreen('start-screen');
  }

  quitFromPause() {
    this.isPaused = false;
    document.getElementById('pause-modal').classList.remove('active');
    this.quitGame();
  }

  updateScoreDisplay() {
    document.getElementById('current-score').textContent = this.score;
  }

  updateLevelDisplay() {
    const levelNames = ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章', '第七章', '第八章', '第九章', '第十章'];
    document.getElementById('current-level').textContent = levelNames[this.level - 1] || '第一章';
  }
}

window.addEventListener('load', () => {
  window.game = new Game();
  window.game.loadChapter1Levels();
});
