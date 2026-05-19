import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'

interface NotifItem {
  id: string
  type: string
  title: string
  body: string
  created_at: string
}

interface NotifListResponse {
  unread_count: number
  total: number
  items: NotifItem[]
}

const PAGE_SIZE = 50

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

export function NotificationsPage(): JSX.Element {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['crm', 'notifications', 'list', { limit: PAGE_SIZE, offset }],
    queryFn: () =>
      api.get<NotifListResponse>(`/crm/notifications/list?limit=${PAGE_SIZE}&offset=${offset}`),
    staleTime: 5_000,
  })

  const markAllRead = useMutation({
    mutationFn: () => api.post<void>('/crm/notifications/mark-all-read', {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm', 'notifications'] })
    },
  })

  const markItemSeen = useMutation({
    mutationFn: (leadId: string) =>
      api.post<void>(`/crm/notifications/${leadId}/seen`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm', 'notifications'] })
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const unread = data?.unread_count ?? 0
  const pageStart = offset + 1
  const pageEnd = Math.min(offset + PAGE_SIZE, total)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-text">Tất cả thông báo</h1>
          <div className="text-[12px] text-text2 mt-1">
            {total > 0 ? `${total} thông báo chưa đọc · Hiển thị ${pageStart}–${pageEnd}` : 'Không có thông báo nào'}
          </div>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="px-3 py-1.5 rounded-r bg-accent text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-r2 overflow-hidden">
        {isLoading ? (
          <div className="px-4 py-12 text-center text-text2">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center text-text3">Không có thông báo nào</div>
        ) : (
          <ul>
            {items.map((it) => (
              <li
                key={it.id}
                onClick={() => {
                  markItemSeen.mutate(it.id)
                  navigate(`/pipeline?lead=${it.id}`)
                }}
                className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-card2 cursor-pointer transition-colors"
              >
                <div className="text-[13px] font-medium text-text">{it.title}</div>
                <div className="text-[12px] text-text2 mt-1">{it.body}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[11px] text-text3">{formatRelative(it.created_at)}</div>
                  <div className="text-[11px] text-accent">Xem chi tiết →</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            disabled={offset === 0}
            className="px-3 py-1.5 rounded-r border border-border text-[12px] text-text disabled:opacity-30"
          >
            ← Trang trước
          </button>
          <div className="text-[12px] text-text2">
            Trang {Math.floor(offset / PAGE_SIZE) + 1} / {Math.ceil(total / PAGE_SIZE)}
          </div>
          <button
            type="button"
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={offset + PAGE_SIZE >= total}
            className="px-3 py-1.5 rounded-r border border-border text-[12px] text-text disabled:opacity-30"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  )
}
