import { useOverdueList } from '../hooks/useOverdueList'
import { OverdueCard } from '../components/OverdueCard'
import { OverdueAlertBanner } from '../components/OverdueAlertBanner'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

export function OverduePage() {
  const { data: cases, isLoading, isError, error, refetch } = useOverdueList()

  const criticalCase = cases?.find((c) => c.overdue_days >= 7)
  const count = cases?.length ?? 0

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">🔴 Thanh toán quá hạn</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            {isLoading
              ? 'Đang tải...'
              : `${count} học viên có khoản thanh toán quá hạn — cần xử lý ngay.`}
          </p>
        </div>
      </header>

      {/* Critical alert banner */}
      {criticalCase && <OverdueAlertBanner topCase={criticalCase} />}

      {isLoading ? (
        <div className="py-16 grid place-items-center">
          <Spinner size={32} className="text-accent" />
        </div>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Không tải được danh sách quá hạn"
          sub={error instanceof Error ? error.message : 'Lỗi không xác định.'}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : cases && cases.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Không có khoản quá hạn"
          sub="Tất cả học viên đang thanh toán đúng hạn."
        />
      ) : (
        <div className="space-y-4">
          {(cases ?? []).map((c) => (
            <OverdueCard key={c.payment_id} case_={c} />
          ))}
        </div>
      )}
    </div>
  )
}
