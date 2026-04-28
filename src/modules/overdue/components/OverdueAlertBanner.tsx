import type { OverdueCase } from '@shared/types/domain'

interface OverdueAlertBannerProps {
  topCase: OverdueCase
}

export function OverdueAlertBanner({ topCase }: OverdueAlertBannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-red/10 border-l-[3px] border-red rounded-r text-[12px]">
      <span className="text-red font-bold shrink-0">🔴 KHẨN CẤP cho Sale</span>
      <span className="text-text2">
        <strong className="text-text">{topCase.contact_name}</strong> quá hạn{' '}
        <strong className="text-red">{topCase.overdue_days} ngày</strong> · đã escalate Admin
      </span>
    </div>
  )
}
