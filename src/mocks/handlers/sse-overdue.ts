import { http, HttpResponse } from 'msw'
import type { OverdueSSEEvent } from '@shared/config/sse-client'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const sseOverdueHandlers = [
  http.get(`${BASE}/api/sse/overdue`, () => {
    const encoder = new TextEncoder()
    const stream = new TransformStream<Uint8Array, Uint8Array>()
    const writer = stream.writable.getWriter()

    const emit = (event: OverdueSSEEvent) => {
      writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)).catch(() => {})
    }

    // First event: warn after 6s
    setTimeout(() => {
      emit({
        type: 'overdue.new',
        severity: 'warn',
        payment_id: 'pay_3',
        contact_name: 'Trần Văn Minh',
        course_name: 'Là Chính Mình B3',
        amount_vnd: 3_250_000,
        overdue_days: 3,
        sale_owner_name: 'Minh Tâm',
        emitted_at: new Date().toISOString(),
      })
    }, 6_000)

    // Second event: critical after 14s
    setTimeout(() => {
      emit({
        type: 'overdue.new',
        severity: 'critical',
        payment_id: 'pay_bao_1',
        contact_name: 'Lưu Văn Bảo',
        course_name: 'Design Thinking B5',
        amount_vnd: 2_833_000,
        overdue_days: 7,
        sale_owner_name: 'Admin Demo',
        emitted_at: new Date().toISOString(),
      })
    }, 14_000)

    return new HttpResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),
]
