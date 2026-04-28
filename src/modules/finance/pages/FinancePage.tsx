import { useState } from 'react'
import { useFinanceSummary } from '../hooks/useFinanceSummary'
import { usePayments } from '../hooks/usePayments'
import type { PaymentFilters } from '../hooks/usePayments'
import { FinanceKpiGrid } from '../components/FinanceKpiGrid'
import { PaymentsFilterBar } from '../components/PaymentsFilterBar'
import { PaymentsSummaryBar } from '../components/PaymentsSummaryBar'
import { PaymentsTable } from '../components/PaymentsTable'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

const DEFAULT_FILTERS: PaymentFilters = {
  from: '2026-04-01',
  to: '2026-04-30',
  course: '',
  status: '',
  page: 1,
  limit: 20,
}

export function FinancePage() {
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_FILTERS)
  const { data: summary, isLoading: loadingSummary } = useFinanceSummary('2026-04')
  const { data: paymentsData, isLoading: loadingPayments, isError, error, refetch } = usePayments(filters)

  const payments = paymentsData?.data ?? []

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">💰 Tài chính</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Tổng quan thanh toán — dữ liệu đồng bộ từ payment gateway.
          </p>
        </div>
      </header>

      {/* KPI Grid */}
      {loadingSummary ? (
        <div className="py-8 grid place-items-center">
          <Spinner size={24} className="text-accent" />
        </div>
      ) : summary ? (
        <FinanceKpiGrid summary={summary} />
      ) : null}

      {/* Transactions */}
      <div className="bg-card border border-border rounded-r2 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border space-y-3">
          <div className="text-[13px] font-semibold text-text">Giao dịch gần đây</div>
          <PaymentsFilterBar
            filters={filters}
            onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
          {payments.length > 0 && (
            <PaymentsSummaryBar payments={payments} filters={filters} />
          )}
        </div>

        {isError ? (
          <EmptyState
            icon="⚠️"
            title="Không tải được giao dịch"
            sub={error instanceof Error ? error.message : 'Lỗi không xác định.'}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : (
          <PaymentsTable payments={payments} isLoading={loadingPayments} />
        )}
      </div>
    </div>
  )
}
