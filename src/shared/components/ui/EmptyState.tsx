import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  sub?: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ icon, title, sub, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-4' : 'py-10',
      ].join(' ')}
    >
      {icon && <div className="text-[28px] mb-2 text-text3">{icon}</div>}
      <div className="text-[13px] font-semibold text-text">{title}</div>
      {sub && <div className="text-[11px] text-text2 mt-1 max-w-[320px]">{sub}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
