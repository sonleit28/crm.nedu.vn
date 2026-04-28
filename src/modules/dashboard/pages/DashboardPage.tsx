import { useState } from 'react'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useCloseRateByCourse } from '../hooks/useCloseRateByCourse'
import { useEnrollmentByCourse } from '../hooks/useEnrollmentByCourse'
import { KpiCard, DeltaBadge } from '../components/KpiCard'
import { RevenueByCourseChart } from '../components/RevenueByCourseChart'
import { CloseRateModal } from '../components/CloseRateModal'
import { EnrollmentModal } from '../components/EnrollmentModal'
import { OverdueAlertBanner } from '../components/OverdueAlertBanner'
import { Spinner } from '@shared/components/ui/Spinner'
import { formatVND } from '@shared/utils/formatVND'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

const MONTH = '2026-04'
const MONTH_LABEL = '04/2026'

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'founder' || role === 'admin'

  const { data: summary, isLoading } = useDashboardSummary(MONTH)
  const { data: closeRate } = useCloseRateByCourse(MONTH)
  const { data: enrollment } = useEnrollmentByCourse(MONTH)

  const [closeRateOpen, setCloseRateOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="py-24 grid place-items-center">
        <Spinner size={32} className="text-accent" />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[20px] font-bold text-text">Dashboard</h1>
        <p className="text-[12px] text-text2 mt-0.5">
          Tổng quan hệ thống · Cập nhật theo tháng [{MONTH_LABEL}]
        </p>
      </header>

      {/* Critical overdue banner */}
      {summary.has_critical_overdue && summary.top_overdue && (
        <OverdueAlertBanner topOverdue={summary.top_overdue} />
      )}

      {/* KPI Grid — 5 cols */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          icon="👥"
          label="Tổng Lead (tháng)"
          value={String(summary.total_leads)}
          footer={<DeltaBadge delta={summary.total_leads_delta_pct} />}
        />
        <KpiCard
          icon="🎯"
          label="Tỷ lệ chốt (tháng)"
          value={`${summary.close_rate_pct.toFixed(1)}%`}
          footer={<DeltaBadge delta={summary.close_rate_delta_pct} />}
          onClick={() => setCloseRateOpen(true)}
        />
        <KpiCard
          icon="✅"
          label="Đăng ký thành công"
          value={String(summary.enrolled_count)}
          footer={<DeltaBadge delta={summary.enrolled_delta_pct} />}
          onClick={() => setEnrollOpen(true)}
        />
        {isAdmin && (
          <KpiCard
            icon="💰"
            label="Doanh thu (tháng)"
            value={formatVND(summary.revenue_vnd)}
            footer={<DeltaBadge delta={summary.revenue_delta_pct} />}
          />
        )}
        <KpiCard
          icon="💬"
          label="Đang được tư vấn"
          value={String(summary.consulting_total)}
          footer={
            <span className="text-text3">
              Tư vấn {summary.consulting_breakdown.consulting} · Follow-up {summary.consulting_breakdown.followup}
            </span>
          }
        />
      </div>

      {/* Revenue chart — admin/founder only */}
      {isAdmin && summary.revenue_by_course.length > 0 && (
        <RevenueByCourseChart
          courses={summary.revenue_by_course}
          month={MONTH_LABEL}
          onBarClick={() => setCloseRateOpen(true)}
        />
      )}

      {/* Modals */}
      <CloseRateModal
        open={closeRateOpen}
        onClose={() => setCloseRateOpen(false)}
        rows={closeRate ?? []}
        month={MONTH_LABEL}
      />
      <EnrollmentModal
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        rows={enrollment ?? []}
        month={MONTH_LABEL}
      />
    </div>
  )
}
