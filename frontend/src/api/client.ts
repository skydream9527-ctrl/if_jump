import axios from 'axios'

export interface PlatformData {
  id: number
  x: number
  y: number
  width: number
  height: number
  theme: string
  type: string
  has_obstacle?: boolean
  obstacle_type?: string
  wait_timer?: number
  has_steam?: boolean
  size_type?: string
  is_wobble?: boolean
  branch?: string
  is_slippery?: boolean
  move_speed?: number
  move_range?: number
  is_boss?: boolean
}

export interface LevelData {
  id: string
  name: string
  description: string
  difficulty: number
  is_boss: boolean
  target_score: number
  platform_count: number
  platforms_config: PlatformData[]
  mechanics_config: any
  rewards_config: any
}

const getPlayerId = (): number => {
  let id = localStorage.getItem('player_id')
  if (!id) {
    id = String(Date.now())
    localStorage.setItem('player_id', id)
  }
  return Number(id)
}

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  config.headers['X-Player-Id'] = String(getPlayerId())
  return config
})

export const chaptersApi = {
  getAll: () => api.get('/api/chapters').then(r => r.data),
  getById: (id: number) => api.get(`/api/chapters/${id}`).then(r => r.data),
  getLevels: (id: number) => api.get(`/api/chapters/${id}/levels`).then(r => r.data),
}

export const levelsApi = {
  getById: (levelId: string) => api.get(`/api/levels/${levelId}`).then(r => r.data as LevelData),
}

export const playerApi = {
  getProfile: () => api.get('/api/player/profile').then(r => r.data),
  updateProfile: (data: { name?: string; coins?: number }) =>
    api.put('/api/player/profile', data).then(r => r.data),
}

export const gameApi = {
  start: (levelId: string) =>
    api.post('/api/game/start', { level_id: levelId, player_id: getPlayerId() }).then(r => r.data),
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
