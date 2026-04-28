import { useState } from 'react'
import { useLeads } from '@modules/pipeline/hooks/useLeads'
import { KanbanBoard } from '@modules/pipeline/components/KanbanBoard'
import { LeadDetailPanel } from '@modules/pipeline/components/LeadDetailPanel'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

export function PipelinePage() {
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const { data, isLoading, isError, error, refetch } = useLeads()

  const total = data?.meta.total ?? 0

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">Pipeline Kanban</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Quản lý pipeline tư vấn — view tổng hợp từ bàn tư vấn viên.
          </p>
        </div>
        <div className="text-[11px] text-text3">
          Tổng <strong className="text-text">{total}</strong> leads
        </div>
      </header>

      {isLoading ? (
        <div className="py-16 grid place-items-center">
          <Spinner size={32} className="text-accent" />
        </div>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Không tải được pipeline"
          sub={error instanceof Error ? error.message : 'Lỗi không xác định.'}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : (
        <KanbanBoard
          leads={data?.data ?? []}
          activeLeadId={activeLeadId}
          onLeadClick={(l) => setActiveLeadId(l.id)}
        />
      )}

      {activeLeadId && (
        <LeadDetailPanel leadId={activeLeadId} onClose={() => setActiveLeadId(null)} />
      )}
    </div>
  )
}
