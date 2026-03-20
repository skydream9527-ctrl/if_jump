import { create } from 'zustand'

export type GamePhase = 'idle' | 'charging' | 'jumping' | 'landing' | 'failed' | 'completed'

interface GameStore {
  sessionId: number | null
  levelId: string | null
  score: number
  combo: number
  perfectJumps: number
  coinsEarned: number
  phase: GamePhase
  startTime: number | null

  startSession: (sessionId: number, levelId: string) => void
  addScore: (points: number) => void
  addCombo: () => void
  resetCombo: () => void
  addPerfectJump: () => void
  addCoin: () => void
  setPhase: (phase: GamePhase) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  sessionId: null,
  levelId: null,
  score: 0,
  combo: 0,
  perfectJumps: 0,
  coinsEarned: 0,
  phase: 'idle',
  startTime: null,

  startSession: (sessionId, levelId) =>
    set({ sessionId, levelId, score: 0, combo: 0, perfectJumps: 0, coinsEarned: 0, phase: 'idle', startTime: Date.now() }),

  addScore: (points) => set((s) => {
    const multiplier = s.combo >= 15 ? 3 : s.combo >= 10 ? 2 : s.combo >= 6 ? 1.5 : s.combo >= 3 ? 1.2 : 1
    return { score: s.score + Math.round(points * multiplier) }
  }),

  addCombo: () => set((s) => ({ combo: s.combo + 1 })),
  resetCombo: () => set({ combo: 0 }),
  addPerfectJump: () => set((s) => ({ perfectJumps: s.perfectJumps + 1 })),
  addCoin: () => set((s) => ({ coinsEarned: s.coinsEarned + 1 })),
  setPhase: (phase) => set({ phase }),
  reset: () => set({ sessionId: null, levelId: null, score: 0, combo: 0, perfectJumps: 0, coinsEarned: 0, phase: 'idle', startTime: null }),
}))
