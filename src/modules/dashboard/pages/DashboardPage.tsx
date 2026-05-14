import { useState } from 'react'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useCloseRateByCourse } from '../hooks/useCloseRateByCourse'
import { useEnrollmentByCourse } from '../hooks/useEnrollmentByCourse'
import { KpiCard, DeltaBadge } from '../components/KpiCard'
import { RevenueByCourseChart } from '../components/RevenueByCourseChart'
import { CloseRateModal } from '../components/CloseRateModal'
import { EnrollmentModal } from '../components/EnrollmentModal'
import { Spinner } from '@shared/components/ui/Spinner'
import { formatVND } from '@shared/utils/formatVND'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

const now = new Date()
const MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const MONTH_LABEL = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = !!user?.roles?.some(
    (r) => r === 'founder' || r === 'admin' || r === 'owner',
  )

  const { data: summary, isLoading, isError, error } = useDashboardSummary(MONTH)
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

  // Graceful error/empty state thay vì blank screen khi endpoint chưa
  // ship hoặc data thiếu. Vẫn render header để em biết đang ở Dashboard.
  if (isError || !summary) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-[20px] font-bold text-text">Tổng quan</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Tổng quan hệ thống · Cập nhật theo tháng [{MONTH_LABEL}]
          </p>
        </header>
        <div className="bg-card border border-border rounded-r2 p-8 text-center text-[13px] text-text2">
          {isError ? (
            <>
              <div className="text-text3 mb-1">⚠️ Không tải được Dashboard</div>
              <div className="text-[12px]">
                {error instanceof Error ? error.message : 'Endpoint chưa ready (BE Dashboard MVP-2).'}
              </div>
            </>
          ) : (
            <div className="text-text3">Chưa có dữ liệu cho tháng này.</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[20px] font-bold text-text">Tổng quan</h1>
        <p className="text-[12px] text-text2 mt-0.5">
          Tổng quan hệ thống · Cập nhật theo tháng [{MONTH_LABEL}]
        </p>
      </header>

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
              Tư vấn {summary.consulting_breakdown.consulting} · Theo dõi {summary.consulting_breakdown.followup}
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
