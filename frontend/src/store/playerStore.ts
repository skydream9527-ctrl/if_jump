import { create } from 'zustand'
import { playerApi } from '../api/client'

export interface PlayerState {
  id: number
  name: string
  total_score: number
  coins: number
  level: number
  current_chapter: number
  badges: Array<{ badge_id: string; name: string }>
  items: Array<{ item_type: string; quantity: number }>
  loaded: boolean
}

interface PlayerStore extends PlayerState {
  fetch: () => Promise<void>
  addCoins: (amount: number) => void
  addScore: (amount: number) => void
  reset: () => void
}

const defaultState: PlayerState = {
  id: 1,
  name: '阿饱',
  total_score: 0,
  coins: 500,
  level: 1,
  current_chapter: 1,
  badges: [],
  items: [],
  loaded: false,
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...defaultState,
  fetch: async () => {
    try {
      const data = await playerApi.getProfile()
      set({ ...data, loaded: true })
    } catch {
      set({ ...defaultState, loaded: true })
    }
  },
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  addScore: (amount) => set((state) => ({ total_score: state.total_score + amount })),
  reset: () => set(defaultState),
}))
