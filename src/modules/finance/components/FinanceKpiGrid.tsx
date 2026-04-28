import type { FinanceSummary } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'

interface FinanceKpiGridProps {
  summary: FinanceSummary
}

export function FinanceKpiGrid({ summary }: FinanceKpiGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        icon="💰"
        label="Tổng thu tháng"
        value={formatVND(summary.total_revenue_vnd)}
        footer={
          <DeltaLabel delta={summary.delta_pct_total_revenue} />
        }
      />
      <KpiCard
        icon="📥"
        label="Đã thu"
        value={formatVND(summary.collected_vnd)}
        valueColor="text-mint"
        footer={<span className="text-text3">{summary.collected_pct}% tổng</span>}
      />
      <KpiCard
        icon="⏳"
        label="Công nợ"
        value={formatVND(summary.receivable_vnd)}
        valueColor="text-amber"
        footer={<span className="text-text3">{summary.receivable_count} học viên</span>}
      />
      <KpiCard
        icon="🔴"
        label="Quá hạn"
        value={formatVND(summary.overdue_vnd)}
        valueColor={summary.overdue_count > 0 ? 'text-red' : 'text-text3'}
        footer={<span className="text-text3">{summary.overdue_count} học viên</span>}
      />
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  valueColor = 'text-text',
  footer,
}: {
  icon: string
  label: string
  value: string
  valueColor?: string
  footer?: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-r2 p-4">
      <div className="text-[11px] uppercase tracking-wider text-text3 mb-3">
        {icon} {label}
      </div>
      <div className={`text-[24px] font-bold leading-none mb-2 ${valueColor}`}>{value}</div>
      <div className="text-[11px]">{footer}</div>
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
