import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOverdueSSEClient } from '@shared/config/sse-client'
import { useToastStore } from '@shared/stores/useToastStore'
import { useOverdueBadgeStore } from '@shared/stores/useOverdueBadgeStore'
import { formatVND } from '@shared/utils/formatVND'

export function useOverdueSSE() {
  const push = useToastStore((s) => s.push)
  const bump = useOverdueBadgeStore((s) => s.bump)
  const navigate = useNavigate()

  useEffect(() => {
    const client = createOverdueSSEClient((event) => {
      const isCritical = event.severity === 'critical'

      push({
        type: isCritical ? 'critical' : 'warn',
        title: isCritical ? '🔴 KHẨN CẤP — Quá hạn' : '🟡 Cảnh báo quá hạn',
        body: `${event.contact_name} · ${event.course_name} · ${formatVND(event.amount_vnd)} · Quá hạn ${event.overdue_days} ngày · Sale: ${event.sale_owner_name}`,
        ttl: 10_000,
        onClick: () => {
          navigate('/overdue')
          return false
        },
      })

      bump()
    })

    return () => client.close()
  }, [push, bump, navigate])
}
