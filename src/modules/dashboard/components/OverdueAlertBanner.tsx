import { useNavigate } from 'react-router-dom'
import type { DashboardSummary } from '@shared/types/domain'

interface OverdueAlertBannerProps {
  topOverdue: NonNullable<DashboardSummary['top_overdue']>
}

export function OverdueAlertBanner({ topOverdue }: OverdueAlertBannerProps) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/overdue')}
      className="flex items-center gap-3 px-4 py-3 bg-red/10 border-l-[3px] border-red rounded-r cursor-pointer hover:bg-red/[0.14] transition-colors"
    >
      <span className="text-red font-bold shrink-0 text-[12px]">🔴 KHẨN CẤP</span>
      <span className="text-[12px] text-text2 flex-1">
        <strong className="text-text">{topOverdue.name}</strong> quá hạn{' '}
        <strong className="text-red">{topOverdue.days} ngày</strong> · đã escalate Admin
      </span>
      <span className="text-text3 text-[11px] shrink-0">→ Xem ngay</span>
    </div>
  )
}
