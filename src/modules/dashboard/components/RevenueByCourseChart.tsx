import type { DashboardSummary } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'

const BAR_COLORS = ['bg-accent', 'bg-teal', 'bg-mint', 'bg-coral', 'bg-muted']

interface RevenueByCourseChartProps {
  courses: DashboardSummary['revenue_by_course']
  month?: string
  onBarClick?: (courseName: string) => void
}

export function RevenueByCourseChart({
  courses,
  month = '04/2026',
  onBarClick,
}: RevenueByCourseChartProps) {
  const maxRevenue = Math.max(...courses.map((c) => c.revenue_vnd), 1)
  const totalRevenue = courses.reduce((s, c) => s + c.revenue_vnd, 0)
  const runningCount = courses.filter((c) => c.course_name !== 'Khác').length

  return (
    <div className="bg-card border border-border rounded-r2 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-[13px] font-semibold text-text">Doanh thu theo khóa (tháng)</div>
          <div className="text-[11px] text-text2 mt-0.5">
            Tổng {formatVND(totalRevenue)} · {runningCount} khóa đang vận hành
          </div>
        </div>
        <span className="text-[11px] text-text3 bg-card2 border border-border px-2 py-1 rounded-r shrink-0">
          Tháng {month}
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-3 h-44">
        {courses.map((c, i) => {
          const heightPct = (c.revenue_vnd / maxRevenue) * 90
          const color = BAR_COLORS[i % BAR_COLORS.length]
          return (
            <div
              key={c.course_id}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
              onClick={() => onBarClick?.(c.course_name)}
            >
              {/* Value */}
              <div className="text-[11px] font-bold text-text">{formatVND(c.revenue_vnd)}</div>
              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: '120px' }}>
                <div
                  className={`w-full ${color} rounded-t-[6px] transition-all group-hover:brightness-110`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              {/* Label */}
              <div className="text-[10px] text-text2 text-center leading-tight">
                {c.course_name.length > 16 ? c.course_name.slice(0, 14) + '…' : c.course_name}
              </div>
              <div className="text-[10px] text-text3">{c.student_count} HV</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
