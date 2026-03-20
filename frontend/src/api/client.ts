import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

export const chaptersApi = {
  getAll: () => api.get('/api/chapters').then(r => r.data),
  getById: (id: number) => api.get(`/api/chapters/${id}`).then(r => r.data),
  getLevels: (id: number) => api.get(`/api/chapters/${id}/levels`).then(r => r.data),
}

export const levelsApi = {
  getById: (levelId: string) => api.get(`/api/levels/${levelId}`).then(r => r.data),
}

export const playerApi = {
  getProfile: () => api.get('/api/player/profile').then(r => r.data),
  updateProfile: (data: { name?: string; coins?: number }) =>
    api.put('/api/player/profile', data).then(r => r.data),
}

export const gameApi = {
  start: (levelId: string) =>
    api.post('/api/game/start', { level_id: levelId, player_id: 1 }).then(r => r.data),
  end: (data: {
    session_id: number
    score: number
    perfect_jumps: number
    coins_earned: number
    completed: boolean
    duration_seconds: number
  }) => api.post('/api/game/end', data).then(r => r.data),
  getLeaderboard: (levelId?: string) =>
    api.get('/api/game/leaderboard', levelId ? { params: { level_id: levelId } } : {}).then(r => r.data),
  getLevelStars: () =>
    api.get('/api/game/level-stars').then(r => r.data) as Promise<Record<string, { stars: number; best_score: number }>>,
}

export const achievementsApi = {
  getAll: () => api.get('/api/achievements').then(r => r.data),
}

export default api
