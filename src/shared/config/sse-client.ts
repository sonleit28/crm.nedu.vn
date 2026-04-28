import { env } from './env'
import { tokenStorage } from './token-storage'

export interface OverdueSSEEvent {
  type: 'overdue.new'
  severity: 'critical' | 'warn'
  payment_id: string
  contact_name: string
  course_name: string
  amount_vnd: number
  overdue_days: number
  sale_owner_name: string
  emitted_at: string
}

export interface SSEClient {
  close: () => void
}

/**
 * Mở connection SSE tới /api/sse/overdue.
 * EventSource không hỗ trợ custom headers nên Authorization được gắn qua query
 * (server cần whitelist `?token=...` cho stream này) — Phase 1 mock chấp nhận.
 */
export function createOverdueSSEClient(
  onMessage: (ev: OverdueSSEEvent) => void,
  onError?: (err: Event) => void,
): SSEClient {
  const token = tokenStorage.getAccess() ?? ''
  const url = `${env.API_URL}/api/sse/overdue${token ? `?token=${encodeURIComponent(token)}` : ''}`
  const es = new EventSource(url)

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as OverdueSSEEvent
      onMessage(data)
    } catch {
      // ignore malformed
    }
  }
  es.onerror = (err) => {
    onError?.(err)
  }

  return {
    close: () => es.close(),
  }
}
