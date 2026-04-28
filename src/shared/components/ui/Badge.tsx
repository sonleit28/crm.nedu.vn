import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'hot'
  | 'warm'
  | 'cold'
  | 'active'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'refunded'
  | 'info'
  | 'diamond'
  | 'gold'
  | 'silver'
  | 'newbie'
  | 'mint'
  | 'amber'
  | 'red'
  | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const VARIANT_STYLE: Record<BadgeVariant, string> = {
  hot: 'bg-red/15 text-red',
  warm: 'bg-amber/15 text-amber',
  cold: 'bg-muted/20 text-text2',
  active: 'bg-mint/15 text-mint',
  pending: 'bg-amber/15 text-amber',
  paid: 'bg-mint/15 text-mint',
  overdue: 'bg-red/15 text-red',
  refunded: 'bg-muted/20 text-text2',
  info: 'bg-accent/15 text-accent',
  diamond: 'bg-accent/15 text-accent',
  gold: 'bg-amber/15 text-amber',
  silver: 'bg-muted/20 text-text2',
  newbie: 'bg-card2 text-text3',
  mint: 'bg-mint/15 text-mint',
  amber: 'bg-amber/15 text-amber',
  red: 'bg-red/15 text-red',
  muted: 'bg-card2 text-text2',
}

export function Badge({ variant = 'info', children, icon, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide',
        VARIANT_STYLE[variant],
        className,
      ].join(' ')}
    >
      {icon}
      <span>{children}</span>
    </span>
  )
}
