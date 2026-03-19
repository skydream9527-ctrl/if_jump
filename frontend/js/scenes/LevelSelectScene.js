/**
 * 关卡选择场景
 */
class LevelSelectScene extends Scene {
  constructor() {
    super('level-select-screen');
    this.api = new APIService();
    this.chapterLevels = [];
    this.selectedLevel = null;
  }

  setupElements() {
    // 设置关卡选择场景的元素
  }

  async init(data = {}) {
    super.init(data);
    await this.loadChapterLevels();
    this.bindEvents();
  }

  async loadChapterLevels() {
    const result = await this.api.getChapterLevels(1, window.gameState.currentUser?.id);
    if (result.success) {
      this.chapterLevels = result.levels;
      this.updateLevelGrid();
      this.updateProgressDisplay();
    }
  }

  updateLevelGrid() {
    const grid = document.getElementById('levels-grid');
    if (!grid) {
      console.error('找不到ID为levels-grid的元素');
      return;
    }
    
    grid.innerHTML = this.chapterLevels.map(level => `
      <div class="level-card ${level.unlocked ? '' : 'locked'}" 
           data-level="${level.id}" 
           data-level-number="${level.levelNumber}"
           data-level-name="${level.name}"
           data-level-desc="${level.description}"
           data-level-target="${level.targetScore}">
        <div class="level-number">#${level.levelNumber}</div>
        <div class="level-icon">${this.getLevelIcon(level.levelNumber)}</div>
        <div class="level-name">${level.name}</div>
        <div class="level-desc">${level.description}</div>
        <div class="level-target">目标分数: ${level.targetScore}</div>
        ${!level.unlocked ? '<div class="lock-icon">🔒</div>' : ''}
      </div>
    `).join('');

    // 为所有未锁定的关卡添加点击事件
    const levelCards = grid.querySelectorAll('.level-card:not(.locked)');
    levelCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const levelId = parseInt(card.dataset.level);
        const levelNumber = parseInt(card.dataset.levelNumber);
        const levelName = card.dataset.levelName;
        const levelDesc = card.dataset.levelDesc;
        const levelTarget = parseInt(card.dataset.levelTarget);
        
        // 移除之前的选择状态
        grid.querySelectorAll('.level-card.selected').forEach(el => {
          el.classList.remove('selected');
        });
        
        // 添加当前选择状态
        card.classList.add('selected');
        this.selectedLevel = { levelId, levelNumber };
        
        // 显示关卡信息
        this.showLevelInfo(levelNumber, levelName, levelDesc, levelTarget);
        
        // 开始游戏
        this.startLevel(levelId, levelNumber);
      });

      // 添加鼠标悬停效果
      card.addEventListener('mouseenter', () => {
        if (!card.classList.contains('locked')) {
          card.classList.add('hover');
        }
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
      });
    });
  }

  showLevelInfo(levelNumber, name, description, targetScore) {
    const infoElement = document.getElementById('level-info');
    if (infoElement) {
      infoElement.innerHTML = `
        <h3>第${levelNumber}关: ${name}</h3>
        <p>${description}</p>
        <p><strong>目标分数: ${targetScore}</strong></p>
      `;
    }
  }

  getLevelIcon(levelNumber) {
    const foodEmojis = ['🥛', '🍜', '🥟', '🥐', '🍳', '🥞', '🍖', '🍔', '🍕', '🍣'];
    return foodEmojis[(levelNumber - 1) % foodEmojis.length];
  }

  updateProgressDisplay() {
    const totalLevels = this.chapterLevels.length;
    const completedLevels = this.chapterLevels.filter(level => level.unlocked).length;
    const progress = Math.round((completedLevels / totalLevels) * 100);

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
  }

  startLevel(levelId, levelNumber) {
    this.engine.goToScene('game', { levelId, levelNumber });
  }

  bindEvents() {
    const backButton = document.getElementById('btn-back-levels');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.engine.goToScene('start');
      });
    }
  }

  unbindEvents() {
    // 解绑事件
  }
}