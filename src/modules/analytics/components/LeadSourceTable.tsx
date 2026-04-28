import { useState } from 'react'
import type { LeadSourceStat } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'
import { Spinner } from '@shared/components/ui/Spinner'

interface LeadSourceTableProps {
  rows: LeadSourceStat[]
  isLoading: boolean
}

type SortKey = 'leads' | 'closed' | 'rate_pct' | 'revenue_vnd'

function rateColor(rate: number) {
  if (rate >= 25) return 'text-mint'
  if (rate >= 15) return 'text-amber'
  return 'text-red'
}

export function LeadSourceTable({ rows, isLoading }: LeadSourceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rate_pct')

  if (isLoading) {
    return <div className="py-8 grid place-items-center"><Spinner size={24} className="text-accent" /></div>
  }

  const sorted = [...rows].sort((a, b) => b[sortKey] - a[sortKey])
  const topRateIdx = sorted.findIndex((r) => r.rate_pct === Math.max(...rows.map((x) => x.rate_pct)))

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-text3 font-semibold cursor-pointer hover:text-text2 select-none"
      onClick={() => setSortKey(k)}
    >
      {label} {sortKey === k && '↓'}
    </th>
  )

  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-text3 font-semibold">Nguồn</th>
          <SortHeader label="Leads" k="leads" />
          <SortHeader label="Chốt" k="closed" />
          <SortHeader label="Tỷ lệ" k="rate_pct" />
          <SortHeader label="Doanh thu" k="revenue_vnd" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((r, i) => {
          const isTop = i === topRateIdx && r.rate_pct > 0
          return (
            <tr key={r.source} className={`border-b border-border/50 ${isTop ? 'font-semibold' : ''}`}>
              <td className="px-4 py-3 text-text">
                {r.source_label}
                {isTop && (
                  <span className="ml-2 text-[10px] bg-amber/15 text-amber border border-amber/30 px-1.5 py-0.5 rounded font-semibold">
                    Top
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-text2">{r.leads}</td>
              <td className="px-4 py-3 text-text2">{r.closed}</td>
              <td className={`px-4 py-3 font-bold ${rateColor(r.rate_pct)}`}>
                {r.rate_pct > 0 ? `${r.rate_pct.toFixed(1)}%` : '—'}
              </td>
              <td className="px-4 py-3 text-text2">
                {r.revenue_vnd > 0 ? formatVND(r.revenue_vnd) : '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
