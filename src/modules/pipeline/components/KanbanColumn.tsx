import type { Lead } from '@shared/types/domain'
import type { StageMeta } from '@shared/utils/enums'
import { LeadCard } from './LeadCard'

interface KanbanColumnProps {
  meta: StageMeta
  leads: Lead[]
  activeLeadId?: string | null
  onLeadClick: (lead: Lead) => void
}

const HEADER_BG: Record<StageMeta['color'], string> = {
  accent: 'bg-accent',
  teal: 'bg-teal',
  amber: 'bg-amber',
  coral: 'bg-coral',
  mint: 'bg-mint',
}

export function KanbanColumn({ meta, leads, activeLeadId, onLeadClick }: KanbanColumnProps) {
  return (
    <section className="flex flex-col min-w-0" aria-label={`Cột ${meta.label}`}>
      <div
        className={[
          HEADER_BG[meta.color],
          'flex items-center justify-between rounded-t-r px-3 py-2 font-bold text-[12px]',
          meta.headerTextDark ? 'text-bg' : 'text-white',
        ].join(' ')}
      >
        <span>{meta.label}</span>
        <span
          className={[
            'min-w-[20px] text-center text-[11px] font-bold rounded',
            meta.headerTextDark ? 'bg-black/15' : 'bg-white/20',
          ].join(' ')}
        >
          {leads.length}
        </span>
      </div>
      <div
        className="flex-1 bg-card rounded-b-r p-2 flex flex-col gap-2 min-h-[300px] border border-border border-t-0 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        {leads.length === 0 ? (
          <div className="text-[11px] text-text3 italic px-2 py-3 text-center">
            Chưa có lead nào ở giai đoạn này
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={onLeadClick}
              active={activeLeadId === lead.id}
            />
          ))
        )}
      </div>
    </section>
  )
}
