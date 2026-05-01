import type { Lead } from '@shared/types/domain'
import { SOURCE_LABEL } from '@shared/utils/enums'
import { LeadScoreBadge } from './LeadScoreBadge'
import { CallbackBadge } from './CallbackBadge'

interface LeadCardProps {
  lead: Lead
  onClick: (lead: Lead) => void
  active?: boolean
}

export function LeadCard({ lead, onClick, active = false }: LeadCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(lead)}
      className={[
        'w-full text-left bg-card2 hover:bg-card2/70 rounded-r p-2.5 transition border',
        active ? 'border-accent/60 ring-1 ring-accent/30' : 'border-transparent',
      ].join(' ')}
      aria-label={`Lead ${lead.name}`}
    >
      <div className="text-[12px] font-semibold text-text leading-tight truncate">
        {lead.name}
      </div>
      <div className="text-[10px] text-text2 mt-0.5 truncate">
        {lead.interested_course ?? 'Khóa: chưa xác định'} · {SOURCE_LABEL[lead.source]}
      </div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <LeadScoreBadge score={lead.lead_score} />
        <CallbackBadge
          callbackAt={lead.callback_at}
          enrolledAt={lead.enrolled_at}
          lastActionAt={lead.last_action_at}
          createdAt={lead.created_at}
          isClosed={lead.current_stage === 'enrolled'}
        />
      </div>
    </button>
  )
}
