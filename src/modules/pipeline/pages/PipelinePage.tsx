import { useMemo, useState } from 'react'
import { useLeads } from '@modules/pipeline/hooks/useLeads'
import { LeadDetailPanel } from '@modules/pipeline/components/LeadDetailPanel'
import { LeadScoreBadge } from '@modules/pipeline/components/LeadScoreBadge'
import { Spinner } from '@shared/components/ui/Spinner'
import { Button } from '@shared/components/ui/Button'
import { SOURCE_LABEL } from '@shared/utils/enums'
import type { Lead, LeadStage } from '@shared/types/domain'

// ─── Stage config ────────────────────────────────────────────────
const STAGE_TABS: Array<{ key: LeadStage; label: string; icon: string; hex: string }> = [
  { key: 'lead_new',   label: 'Lead mới',   icon: '👁',  hex: '#0EA5E9' },
  { key: 'contacted',  label: 'Tiếp cận',   icon: '💡',  hex: '#06B6D4' },
  { key: 'consulting', label: 'Tư vấn',     icon: '🤔',  hex: '#F59E0B' },
  { key: 'followup',   label: 'Follow-up',  icon: '🎯',  hex: '#F97316' },
  { key: 'closed',     label: 'Chốt đơn',  icon: '✅',  hex: '#10B981' },
]

// ─── Priority derived from lead_score ────────────────────────────
type Priority = 'high' | 'medium' | 'low'

function getPriority(score: number): Priority {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const PRIORITY_COLOR: Record<Priority, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#64748b',
}

function PriorityDot({ score }: { score: number }) {
  const p = getPriority(score)
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: PRIORITY_COLOR[p],
        flexShrink: 0,
      }}
      title={p === 'high' ? 'Hot' : p === 'medium' ? 'Warm' : 'Cold'}
    />
  )
}

// ─── Stage badge ─────────────────────────────────────────────────
function StageBadge({ stage }: { stage: LeadStage }) {
  const meta = STAGE_TABS.find((s) => s.key === stage)!
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: meta.hex,
        background: meta.hex + '1a',
        padding: '4px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {meta.icon} {meta.label}
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────
export function PipelinePage() {
  const { data, isLoading, isError, refetch } = useLeads({ limit: 200 })
  const leads: Lead[] = data?.data ?? []

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<LeadStage | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConsultant, setSelectedConsultant] = useState('all')

  // ── Unique consultants ──
  const consultants = useMemo(() => {
    const names = new Set(leads.map((l) => l.assigned_to_name).filter(Boolean) as string[])
    return Array.from(names).sort()
  }, [leads])

  // ── Stage counts (before consultant / search filter so tabs always show total per stage) ──
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    STAGE_TABS.forEach((s) => (counts[s.key] = 0))
    leads.forEach((l) => {
      if (counts[l.current_stage] !== undefined) counts[l.current_stage]++
    })
    return counts
  }, [leads])

  // ── Filtered rows ──
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (selectedStage && l.current_stage !== selectedStage) return false
      if (selectedConsultant !== 'all' && l.assigned_to_name !== selectedConsultant) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const nameMatch = l.name.toLowerCase().includes(q)
        const phoneMatch = (l.phone ?? '').includes(q)
        if (!nameMatch && !phoneMatch) return false
      }
      return true
    })
  }, [leads, selectedStage, searchQuery, selectedConsultant])

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <header>
        <h1 className="text-[20px] font-bold text-text">📋 Pipeline Tư Vấn</h1>
        <p className="text-[12px] text-text2 mt-0.5">
          Theo dõi tiến trình chăm sóc khách hàng — {data?.meta.total ?? 0} leads
        </p>
      </header>

      {isLoading ? (
        <div className="py-16 grid place-items-center">
          <Spinner size={32} className="text-accent" />
        </div>
      ) : isError ? (
        <div className="py-16 grid place-items-center gap-3">
          <p className="text-text2 text-sm">Không tải được pipeline.</p>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          {/* ── Stage tabs ── */}
          <div
            style={{
              display: 'flex',
              background: '#132040',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {STAGE_TABS.map((stage) => {
              const isActive = selectedStage === stage.key
              const count = stageCounts[stage.key]
              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setSelectedStage(isActive ? null : stage.key)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isActive ? stage.hex + '22' : 'transparent',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: isActive ? `3px solid ${stage.hex}` : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 18 }}>{stage.icon}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: isActive ? stage.hex : '#94a3b8',
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: stage.hex,
                      marginTop: 2,
                    }}
                  >
                    {count}
                  </div>
                </button>
              )
            })}
          </div>

          {/* ── Filters ── */}
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="🔍 Tìm tên hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#132040',
                color: '#e2e8f0',
                fontSize: 13,
                width: 220,
                outline: 'none',
              }}
            />
            <select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#132040',
                color: '#e2e8f0',
                fontSize: 13,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">👤 Tất cả tư vấn viên</option>
              {consultants.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(selectedStage || selectedConsultant !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStage(null)
                  setSelectedConsultant('all')
                  setSearchQuery('')
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: '#1E3A5F',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✕ Đặt lại bộ lọc
              </button>
            )}

            <span
              style={{
                marginLeft: 'auto',
                alignSelf: 'center',
                fontSize: 12,
                color: '#64748b',
              }}
            >
              {filtered.length} kết quả
            </span>
          </div>

          {/* ── Table ── */}
          <div
            style={{
              background: '#132040',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['', 'Tên KH', 'SĐT', 'Khóa quan tâm', 'Nguồn', 'Tư vấn viên', 'Lead score', 'Giai đoạn'].map(
                    (h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'left',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          position: 'sticky',
                          top: 0,
                          background: '#132040',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                      Không có lead nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      isActive={lead.id === activeLeadId}
                      onClick={() => setActiveLeadId(lead.id === activeLeadId ? null : lead.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Detail panel ── */}
      {activeLeadId && (
        <LeadDetailPanel leadId={activeLeadId} onClose={() => setActiveLeadId(null)} />
      )}
    </div>
  )
}

// ─── Table row ───────────────────────────────────────────────────
function LeadRow({
  lead,
  isActive,
  onClick,
}: {
  lead: Lead
  isActive: boolean
  onClick: () => void
}) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        background: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? 'rgba(14,165,233,0.08)' : 'transparent'
      }}
    >
      {/* Priority dot */}
      <td style={{ padding: '10px 14px', width: 24 }}>
        <PriorityDot score={lead.lead_score} />
      </td>
      {/* Name */}
      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
        {lead.name}
      </td>
      {/* Phone */}
      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
        {lead.phone ?? '—'}
      </td>
      {/* Course */}
      <td style={{ padding: '10px 14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
        {lead.interested_course ?? '—'}
      </td>
      {/* Source */}
      <td style={{ padding: '10px 14px' }}>
        <span
          style={{
            fontSize: 11,
            background: 'rgba(255,255,255,0.06)',
            padding: '3px 10px',
            borderRadius: 6,
            color: '#94a3b8',
            fontWeight: 500,
          }}
        >
          {SOURCE_LABEL[lead.source]}
        </span>
      </td>
      {/* Consultant */}
      <td style={{ padding: '10px 14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
        {lead.assigned_to_name ?? '—'}
      </td>
      {/* Lead score badge */}
      <td style={{ padding: '10px 14px' }}>
        <LeadScoreBadge score={lead.lead_score} />
      </td>
      {/* Stage badge */}
      <td style={{ padding: '10px 14px' }}>
        <StageBadge stage={lead.current_stage} />
      </td>
    </tr>
  )
}
