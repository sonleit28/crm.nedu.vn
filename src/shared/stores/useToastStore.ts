import { create } from 'zustand'

export type ToastType = 'info' | 'success' | 'warn' | 'critical' | 'error'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  body?: string
  meta?: string
  /** Time-to-live in ms; 0 = persistent. Default 5000. */
  ttl?: number
  /** Optional click handler. Returns true to keep toast open, false/undefined to dismiss. */
  onClick?: () => void | boolean
}

interface ToastState {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const item: ToastItem = { ttl: 5000, ...toast, id }
    set((s) => ({ toasts: [...s.toasts, item] }))
    if (item.ttl && item.ttl > 0) {
      setTimeout(() => get().dismiss(id), item.ttl)
    }
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))
