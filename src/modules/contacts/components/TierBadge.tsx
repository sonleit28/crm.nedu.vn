import type { ContactTier } from '@shared/types/domain'

interface TierBadgeProps {
  tier: ContactTier
  large?: boolean
}

const TIER_MAP: Record<
  ContactTier,
  { icon: string; label: string; cls: string; desc: string }
> = {
  diamond: {
    icon: '💎',
    label: 'Kim cương',
    cls: 'bg-[rgba(14,165,233,0.15)] text-accent border border-accent/30',
    desc: 'VIP · ≥3 khóa hoặc ≥10M',
  },
  gold: {
    icon: '🥇',
    label: 'Vàng',
    cls: 'bg-[rgba(245,158,11,0.15)] text-amber border border-amber/30',
    desc: 'Thân thiết · ≥2 khóa hoặc ≥5M',
  },
  silver: {
    icon: '🥈',
    label: 'Bạc',
    cls: 'bg-[rgba(148,163,184,0.15)] text-text2 border border-border',
    desc: 'Mới · ≥1 khóa hoặc ≥1M',
  },
  newbie: {
    icon: '',
    label: '—',
    cls: 'text-text3',
    desc: 'Chưa enroll',
  },
}

export function TierBadge({ tier, large = false }: TierBadgeProps) {
  const t = TIER_MAP[tier]
  if (tier === 'newbie') {
    return <span className="text-text3 text-[11px]">—</span>
  }
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-r font-semibold',
        large ? 'px-3 py-1.5 text-[13px]' : 'px-2 py-0.5 text-[11px]',
        t.cls,
      ].join(' ')}
      title={t.desc}
    >
      {t.icon} {t.label}
    </span>
  )
}
