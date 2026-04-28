import type { FunnelRow } from '@shared/types/domain'
import { Spinner } from '@shared/components/ui/Spinner'

interface ConversionFunnelTableProps {
  rows: FunnelRow[]
  isLoading: boolean
}

function rateColor(rate: number) {
  if (rate >= 70) return 'text-mint'
  if (rate >= 50) return 'text-amber'
  return 'text-red'
}

export function ConversionFunnelTable({ rows, isLoading }: ConversionFunnelTableProps) {
  if (isLoading) {
    return <div className="py-8 grid place-items-center"><Spinner size={24} className="text-accent" /></div>
  }

  // Find stage with lowest rate (skip first row)
  const lowestIdx = rows.slice(1).reduce(
    (minI, r, i) => (r.conversion_pct < (rows.slice(1)[minI]?.conversion_pct ?? Infinity) ? i : minI),
    0,
  ) + 1

  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-border">
          {['Giai đoạn', 'Số lượng', 'Tỷ lệ qua bước'].map((h) => (
            <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-text3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const isFirst = i === 0
          const isLast = i === rows.length - 1
          const isLowest = i === lowestIdx
          return (
            <tr
              key={r.stage}
              className={[
                'border-b border-border/50',
                isLowest ? 'bg-red/[0.04]' : '',
              ].join(' ')}
              title={isLowest ? 'Cải thiện ưu tiên' : undefined}
            >
              <td className={`px-4 py-3 ${isFirst || isLast ? 'font-bold text-text' : 'text-text'}`}>
                {r.label}
                {isLowest && (
                  <span className="ml-2 text-[10px] text-red border border-red/40 px-1.5 py-0.5 rounded">
                    Ưu tiên cải thiện
                  </span>
                )}
              </td>
              <td className={`px-4 py-3 ${isFirst || isLast ? 'font-bold text-text' : 'text-text2'}`}>
                {r.count}
              </td>
              <td className={`px-4 py-3 font-semibold ${isFirst ? 'text-text3' : rateColor(r.conversion_pct)}`}>
                {isFirst ? '—' : `${r.conversion_pct.toFixed(1)}%`}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
