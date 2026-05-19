import { useEffect, useRef, useState } from 'react'
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

interface NotifSummary {
  unread_count: number
  items: NotifItem[]
}

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

// NotificationBell — chuông badge ở Topbar.
// Subscribe summary mỗi 15s, hiển thị số unread + dropdown 5 item gần nhất.
// Click "Đánh dấu đã đọc" → BE mark + đẩy Space chấm đỏ CRM về 0.
export function NotificationBell(): JSX.Element {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['crm', 'notifications', 'summary'],
    queryFn: () => api.get<NotifSummary>('/crm/notifications/summary'),
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const markAllRead = useMutation({
    mutationFn: () => api.post<void>('/crm/notifications/mark-all-read', {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm', 'notifications'] })
      setOpen(false)
    },
  })

  const markItemSeen = useMutation({
    mutationFn: (leadId: string) =>
      api.post<void>(`/crm/notifications/${leadId}/seen`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm', 'notifications'] })
    },
  })

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent): void {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const unread = data?.unread_count ?? 0
  const items = data?.items ?? []

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 grid place-items-center rounded-r bg-card2 border border-border text-text2 hover:text-text relative"
        aria-label="Notifications"
        title="Thông báo"
      >
        🔔
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-white text-[10px] font-bold grid place-items-center"
            aria-label={`${unread} chưa đọc`}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-h-[480px] overflow-hidden rounded-r2 bg-card border border-border shadow-xl z-40 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-[13px] font-semibold text-text">
              Thông báo {unread > 0 && <span className="text-text2">({unread})</span>}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-[11px] text-accent hover:underline disabled:opacity-50"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-text3">
                Không có thông báo mới
              </div>
            ) : (
              <ul>
                {items.map((it) => (
                  <li
                    key={it.id}
                    onClick={() => {
                      // Mark item seen → BE recompute unread → bell -1 + Space -1.
                      // Sau đó navigate đến Pipeline với lead id để xem chi tiết.
                      markItemSeen.mutate(it.id)
                      navigate(`/pipeline?lead=${it.id}`)
                      setOpen(false)
                    }}
                    className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-card2 cursor-pointer transition-colors"
                  >
                    <div className="text-[12px] font-medium text-text">{it.title}</div>
                    <div className="text-[11px] text-text2 mt-0.5 line-clamp-2">{it.body}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[10px] text-text3">{formatRelative(it.created_at)}</div>
                      <div className="text-[10px] text-accent">Xem chi tiết →</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer: nếu còn unread chưa hiện hết hoặc nếu có items, show link "Xem tất cả". */}
          {(unread > items.length || items.length > 0) && (
            <button
              type="button"
              onClick={() => {
                navigate('/notifications')
                setOpen(false)
              }}
              className="px-4 py-3 border-t border-border text-center text-[12px] text-accent hover:bg-card2 cursor-pointer transition-colors w-full font-medium"
            >
              {unread > items.length
                ? `Xem tất cả (${unread - items.length} thông báo khác) →`
                : 'Xem trang thông báo →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
