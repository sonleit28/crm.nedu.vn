import { getLeadScoreBucket } from '@shared/utils/leadScore'

interface LeadScoreBadgeProps {
  score: number
  showScore?: boolean
}

const STYLE = {
  hot: 'bg-red/15 text-red',
  warm: 'bg-amber/15 text-amber',
  cold: 'bg-muted/20 text-text2',
} as const

export function LeadScoreBadge({ score, showScore = false }: LeadScoreBadgeProps) {
  const info = getLeadScoreBucket(score)
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md px-1.5 py-[2px] text-[10px] font-bold uppercase',
        STYLE[info.bucket],
      ].join(' ')}
      title={`Lead score: ${score}`}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
      {showScore && <span className="opacity-70">· {score}</span>}
    </span>
  )
}
