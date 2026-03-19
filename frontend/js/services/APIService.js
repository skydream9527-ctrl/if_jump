/**
 * API服务类
 */
class APIService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return await response.json();
  }

  async register(username, password) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async login(username, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async submitScore(userId, username, score, level, chapter) {
    return this.request('/score', {
      method: 'POST',
      body: JSON.stringify({ userId, username, score, level, chapter })
    });
  }

  async getLeaderboard(limit = 20) {
    return this.request(`/leaderboard?limit=${limit}`);
  }

  async getUserScores(userId) {
    return this.request(`/user/${userId}/scores`);
  }

  async getUserProgress(userId) {
    return this.request(`/user/${userId}/progress`);
  }

  async getChapterLevels(chapter, userId = null) {
    const params = new URLSearchParams({ chapter });
    if (userId) {
      params.append('userId', userId);
    }
    return this.request(`/game/levels?${params}`);
  }

  async getLevelDetails(levelId) {
    return this.request(`/game/level/${levelId}/details`);
  }
}