import type { FinanceSummary } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'

interface FinanceKpiGridProps {
  summary: FinanceSummary
}

// Simplified sau khi drop installment scheme (2026-05-13): chỉ còn Tổng thu tháng.
// Collected / Công nợ / Quá hạn KPI đã bỏ vì không còn AR concept.
// Defensive `?? 0` để phòng case stale cache khi chuyển shape.
export function FinanceKpiGrid({ summary }: FinanceKpiGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-r2 p-5">
        <div className="text-[11px] uppercase tracking-wider text-text3 mb-3">
          💰 Tổng thu tháng
        </div>
        <div className="text-[24px] font-bold text-text leading-none mb-2">
          {formatVND(summary.total_revenue_vnd ?? 0)}
        </div>
        <div className="text-[11px]">
          <DeltaLabel delta={summary.delta_pct_total_revenue ?? 0} />
        </div>
      </div>
    </div>
  )
}

function DeltaLabel({ delta }: { delta: number }) {
  const up = delta >= 0
  return (
    <span className={up ? 'text-mint' : 'text-red'}>
      {up ? '↑' : '↓'} {Math.abs(delta)}% vs tháng trước
    </span>
  )
}
