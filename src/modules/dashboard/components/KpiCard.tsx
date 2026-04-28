import type { ReactNode } from 'react'

interface KpiCardProps {
  icon: string
  label: string
  value: string
  footer?: ReactNode
  onClick?: () => void
}

export function KpiCard({ icon, label, value, footer, onClick }: KpiCardProps) {
  const clickable = !!onClick
  return (
    <div
      onClick={onClick}
      className={[
        'bg-card border border-border rounded-r2 p-4 relative group transition-transform',
        clickable ? 'cursor-pointer hover:-translate-y-0.5' : '',
      ].join(' ')}
    >
      <div className="text-[11px] uppercase tracking-wider text-text3 mb-3">
        {icon} {label}
      </div>
      <div className="text-[30px] font-bold text-text leading-none mb-2">{value}</div>
      {footer && <div className="text-[11px]">{footer}</div>}
      {clickable && (
        <span className="absolute top-4 right-4 text-text3 text-[16px] transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      )}
    </div>
  )
}

export function DeltaBadge({ delta }: { delta: number }) {
  const up = delta >= 0
  return (
    <span className={up ? 'text-mint' : 'text-red'}>
      {up ? '↑' : '↓'} {Math.abs(delta)}% vs tháng trước
    </span>
  )
}
