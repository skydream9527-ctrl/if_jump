const API_BASE = 'http://localhost:3001/api';

const API = {
  async register(username, password) {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  },

  async login(username, password) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  },

  async submitScore(userId, username, score, level, chapter) {
    const response = await fetch(`${API_BASE}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, score, level, chapter })
    });
    return await response.json();
  },

  async getLeaderboard(limit = 20) {
    const response = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);
    return await response.json();
  },

  async getUserScores(userId) {
    const response = await fetch(`${API_BASE}/user/${userId}/scores`);
    return await response.json();
  },

  async getUserProgress(userId) {
    const response = await fetch(`${API_BASE}/user/${userId}/progress`);
    return await response.json();
  },

  async getChapterLevels(chapter, userId = null) {
    const params = new URLSearchParams({ chapter });
    if (userId) {
      params.append('userId', userId);
    }
    const response = await fetch(`${API_BASE}/game/levels?${params}`);
    return await response.json();
  },

  async getLevelDetails(levelId) {
    const response = await fetch(`${API_BASE}/game/level/${levelId}/details`);
    return await response.json();
  }
};
