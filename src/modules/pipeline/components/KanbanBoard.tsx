import type { Lead, LeadStage } from '@shared/types/domain'
import { STAGE_META } from '@shared/utils/enums'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  leads: Lead[]
  activeLeadId?: string | null
  onLeadClick: (lead: Lead) => void
}

export function KanbanBoard({ leads, activeLeadId, onLeadClick }: KanbanBoardProps) {
  const grouped: Record<LeadStage, Lead[]> = {
    awareness: [],
    interest: [],
    consideration: [],
    intent: [],
    enrolled: [],
    retention: [],
  }
  for (const l of leads) {
    grouped[l.current_stage].push(l)
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
    >
      {STAGE_META.map((meta) => (
        <KanbanColumn
          key={meta.key}
          meta={meta}
          leads={grouped[meta.key]}
          activeLeadId={activeLeadId}
          onLeadClick={onLeadClick}
        />
      ))}
    </div>
  )
}
