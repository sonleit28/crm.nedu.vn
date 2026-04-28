import { AnalyticsTabs } from '../components/AnalyticsTabs'

export function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[20px] font-bold text-text">📈 Analytics</h1>
        <p className="text-[12px] text-text2 mt-0.5">
          Phân tích hiệu quả marketing, tư vấn, và khóa học.
        </p>
        <div className="mt-2 text-[11px] text-text3 bg-card2 border border-border inline-block px-3 py-1 rounded-r">
          Tháng 04/2026 · DateRangePicker → Phase 2
        </div>
      </header>

      <AnalyticsTabs />
    </div>
  )
}
