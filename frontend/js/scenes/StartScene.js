/**
 * 开始场景
 */
class StartScene extends Scene {
  constructor() {
    super('start-screen');
    this.api = new APIService();
  }

  setupElements() {
    // 设置开始场景的元素
  }

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      this.engine.goToScene('level-select');
    });

    document.getElementById('btn-login').addEventListener('click', () => {
      this.showAuthModal('login');
    });

    document.getElementById('btn-register').addEventListener('click', () => {
      this.showAuthModal('register');
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.engine.goToScene('leaderboard');
    });

    // 绑定认证表单事件
    document.querySelector('.close-modal')?.addEventListener('click', () => this.hideAuthModal());
    document.getElementById('auth-form')?.addEventListener('submit', (e) => this.handleAuth(e));
  }

  unbindEvents() {
    // 解绑事件
  }

  showAuthModal(type) {
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('auth-title').textContent = type === 'login' ? '登录' : '注册';
    this.authType = type;
    document.getElementById('auth-error').textContent = '';
  }

  async handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    try {
      const result = this.authType === 'login'
        ? await this.api.login(username, password)
        : await this.api.register(username, password);

      if (result.success) {
        window.gameState.currentUser = result.user;
        this.hideAuthModal();
        alert(this.authType === 'login' ? '登录成功！' : '注册成功！');
      } else {
        errorEl.textContent = result.error;
      }
    } catch (err) {
      errorEl.textContent = '网络错误，请稍后重试';
    }
  }

  hideAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
  }
}