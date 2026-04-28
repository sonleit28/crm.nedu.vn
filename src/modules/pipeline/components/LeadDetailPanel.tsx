import { useEffect, useState } from 'react'
import type { LeadStage } from '@shared/types/domain'
import { SOURCE_LABEL, STAGE_LABEL, ACTION_TYPE_META } from '@shared/utils/enums'
import { formatDateTimeVN, timeAgoVN } from '@shared/utils/formatDateVN'
import { Button } from '@shared/components/ui/Button'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { LeadScoreBadge } from './LeadScoreBadge'
import { NoteEditor } from './NoteEditor'
import { StageMoveDialog } from './StageMoveDialog'
import { useLead } from '@modules/pipeline/hooks/useLead'
import { usePipelineActions } from '@modules/pipeline/hooks/usePipelineActions'
import { useMoveLeadStage } from '@modules/pipeline/hooks/useMoveLeadStage'
import { useAddLeadAction } from '@modules/pipeline/hooks/useAddLeadAction'
import { useToastStore } from '@shared/stores/useToastStore'

interface LeadDetailPanelProps {
  leadId: string
  onClose: () => void
}

export function LeadDetailPanel({ leadId, onClose }: LeadDetailPanelProps) {
  const { data: lead, isLoading: loadingLead } = useLead(leadId)
  const { data: actions, isLoading: loadingActions } = usePipelineActions(leadId)
  const [noteOpen, setNoteOpen] = useState(false)
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const moveMut = useMoveLeadStage()
  const actionMut = useAddLeadAction()
  const pushToast = useToastStore((s) => s.push)

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !stageDialogOpen) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, stageDialogOpen])

  const handleAddNote = async (note: string) => {
    if (!lead) return
    await actionMut.mutateAsync({ leadId: lead.id, action_type: 'note', note })
    pushToast({
      type: 'success',
      title: 'Đã thêm ghi chú',
      meta: formatDateTimeVN(new Date().toISOString()),
      ttl: 3500,
    })
    setNoteOpen(false)
  }

  const handleCall = async () => {
    if (!lead?.phone) {
      pushToast({ type: 'warn', title: 'Lead này không có SĐT', ttl: 3000 })
      return
    }
    window.location.href = `tel:${lead.phone}`
    await actionMut.mutateAsync({
      leadId: lead.id,
      action_type: 'call',
      note: 'Bấm gọi từ Pipeline panel.',
    })
    pushToast({ type: 'success', title: 'Đã ghi nhận cuộc gọi', ttl: 3500 })
  }

  const handleMoveStage = async (toStage: LeadStage, note?: string) => {
    if (!lead) return
    await moveMut.mutateAsync({ leadId: lead.id, to_stage: toStage, note })
    pushToast({
      type: 'success',
      title: `Đã chuyển sang ${STAGE_LABEL[toStage]}`,
      ttl: 3500,
    })
    setStageDialogOpen(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[700] bg-black/40 anim-fade"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-[710] w-[480px] max-w-full bg-card border-l border-border shadow-2xl anim-panel flex flex-col"
        role="dialog"
        aria-label="Lead detail"
      >
        {loadingLead || !lead ? (
          <div className="flex-1 grid place-items-center">
            <Spinner size={28} className="text-accent" />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-border">
              <div className="min-w-0">
                <h3 className="text-[18px] font-bold text-text leading-tight truncate">
                  {lead.name}
                </h3>
                <div className="text-[12px] text-text2 mt-1 truncate">
                  {lead.phone ?? '— SĐT —'} · {lead.email ?? '— email —'}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-text3 hover:text-text w-8 h-8 grid place-items-center rounded hover:bg-card2 shrink-0"
                aria-label="Đóng"
              >
                ✕
              </button>
            </header>

            {/* Body scroll */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Section 1: Thông tin cơ bản */}
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  Thông tin cơ bản
                </div>
                <div className="bg-card2 rounded-r p-3 space-y-1.5 text-[12px]">
                  <KvRow label="Giai đoạn" value={STAGE_LABEL[lead.current_stage]} />
                  <KvRow label="Nguồn" value={SOURCE_LABEL[lead.source]} />
                  <KvRow label="Khóa quan tâm" value={lead.interested_course ?? '—'} />
                  <KvRow
                    label="TV viên phụ trách"
                    value={
                      <span className="text-accent">{lead.assigned_to_name ?? '—'}</span>
                    }
                  />
                  <KvRow
                    label="Tạo lúc"
                    value={`${formatDateTimeVN(lead.created_at)} · ${timeAgoVN(lead.created_at)}`}
                  />
                  {lead.callback_at && (
                    <KvRow
                      label="Lịch gọi lại"
                      value={
                        <span className="text-amber font-semibold">
                          {formatDateTimeVN(lead.callback_at)}
                        </span>
                      }
                    />
                  )}
                </div>
              </section>

              {/* Section 2: Lead score */}
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  Lead score
                </div>
                <div className="bg-card2 rounded-r p-3 flex items-center gap-3">
                  <div className="text-[28px] font-bold text-text leading-none">
                    {lead.lead_score}
                  </div>
                  <div className="flex-1">
                    <LeadScoreBadge score={lead.lead_score} showScore={false} />
                    <div className="text-[11px] text-text2 mt-1">
                      Tự động: nguồn ({SOURCE_LABEL[lead.source]}) + test_result
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Lịch sử tương tác */}
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  Lịch sử tương tác
                </div>
                {loadingActions ? (
                  <div className="py-4 grid place-items-center">
                    <Spinner size={20} className="text-accent" />
                  </div>
                ) : !actions || actions.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="Chưa có hoạt động"
                    sub="Thêm ghi chú, gọi, hoặc chuyển giai đoạn để bắt đầu lịch sử."
                    compact
                  />
                ) : (
                  <ol className="space-y-2.5">
                    {actions.map((a) => {
                      const meta = ACTION_TYPE_META[a.action_type]
                      const stageInfo =
                        a.action_type === 'move' || a.action_type === 'enroll'
                          ? `${a.from_stage ? STAGE_LABEL[a.from_stage] : '—'} → ${a.to_stage ? STAGE_LABEL[a.to_stage] : '—'}`
                          : null
                      return (
                        <li
                          key={a.id}
                          className="flex gap-2.5 bg-card2 rounded-r p-2.5 text-[12px]"
                        >
                          <span className="text-base leading-none mt-[2px]">{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-text">{meta.label}</div>
                            {stageInfo && (
                              <div className="text-[11px] text-text2 mt-0.5">{stageInfo}</div>
                            )}
                            {a.note && (
                              <div className="text-[12px] text-text mt-1 leading-snug">
                                {a.note}
                              </div>
                            )}
                            <div className="text-[10px] text-text3 mt-1">
                              {formatDateTimeVN(a.created_at)} · {a.performed_by_name ?? a.performed_by}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>

              {/* Section 4: Note editor inline */}
              {noteOpen && (
                <section className="bg-card2/50 rounded-r p-3 border border-amber/30">
                  <div className="text-[11px] text-text2 mb-2">💬 Ghi chú mới</div>
                  <NoteEditor
                    onSave={handleAddNote}
                    onCancel={() => setNoteOpen(false)}
                    saving={actionMut.isPending}
                  />
                </section>
              )}
            </div>

            {/* Footer actions */}
            <footer className="border-t border-border px-5 py-3 flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={handleCall}
                disabled={!lead.phone || actionMut.isPending}
              >
                📞 Gọi điện
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setNoteOpen((v) => !v)}
                  disabled={actionMut.isPending}
                >
                  💬 Ghi chú
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setStageDialogOpen(true)}
                  disabled={moveMut.isPending}
                >
                  🔀 Chuyển giai đoạn
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>

      {lead && (
        <StageMoveDialog
          open={stageDialogOpen}
          lead={lead}
          onClose={() => setStageDialogOpen(false)}
          onConfirm={handleMoveStage}
          saving={moveMut.isPending}
        />
      )}
    </>
  )
}

function KvRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-text2 text-[11px] shrink-0">{label}</span>
      <span className="text-text text-right truncate">{value}</span>
    </div>
  )
}
