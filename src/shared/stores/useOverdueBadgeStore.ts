import { create } from 'zustand'

interface OverdueBadgeState {
  count: number
  set: (count: number) => void
  bump: () => void
  reset: () => void
}

export const useOverdueBadgeStore = create<OverdueBadgeState>((set) => ({
  count: 0,
  set: (count) => set({ count }),
  bump: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}))
