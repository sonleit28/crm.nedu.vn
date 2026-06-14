import type { ConsultantKpi } from '@shared/types/domain'
import { Spinner } from '@shared/components/ui/Spinner'

interface ConsultantKpiTableProps {
  rows: ConsultantKpi[]
  isLoading: boolean
}

function responseColor(hours: number) {
  if (hours <= 3) return 'text-mint'
  if (hours <= 5) return 'text-text'
  return 'text-red'
}

export function ConsultantKpiTable({ rows, isLoading }: ConsultantKpiTableProps) {
  if (isLoading) {
    return <div className="py-8 grid place-items-center"><Spinner size={24} className="text-accent" /></div>
  }

  const sorted = [...rows].sort((a, b) => b.rate_pct - a.rate_pct)
  const topRate = Math.max(...rows.map((r) => r.rate_pct))

  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-border">
          {['TV viên', 'Leads', 'Chốt', 'Tỷ lệ', 'TB phản hồi (giờ)'].map((h) => (
            <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-text3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => {
          const isTop = r.rate_pct === topRate && topRate > 0
          return (
            <tr key={r.consultant_id} className="border-b border-border/50">
              <td className="px-4 py-3 text-text font-medium">
                {r.consultant_name}
                {isTop && (
                  <span className="ml-2 text-[10px] bg-mint/15 text-mint border border-mint/30 px-1.5 py-0.5 rounded font-semibold">
                    Top
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-text2">{r.leads}</td>
              <td className="px-4 py-3 text-text2">{r.closed}</td>
              <td className="px-4 py-3 font-bold text-text">
                {r.rate_pct > 0 ? `${r.rate_pct.toFixed(1)}%` : '—'}
              </td>
              <td className={`px-4 py-3 font-semibold ${responseColor(r.avg_response_hours)}`}>
                {r.avg_response_hours != null && !Number.isNaN(r.avg_response_hours)
                  ? `${r.avg_response_hours.toFixed(1)}h`
                  : '—'}
                {r.avg_response_hours > 5 && <span className="ml-1">🚩</span>}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
