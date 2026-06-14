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
import { api } from '@shared/config/api-client'
import { exportToCsv } from '@shared/utils/exportCsv'
import { formatDateVN } from '@shared/utils/formatDateVN'
import { useToastStore } from '@shared/stores/useToastStore'
import type { Payment } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'

const METHOD_EXPORT_LABEL: Record<string, string> = {
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
  ewallet: 'Ví điện tử',
}

const GATEWAY_EXPORT_LABEL: Record<string, string> = {
  vnpay: 'VNPay',
  stripe: 'Stripe',
  momo: 'MoMo',
  manual: 'Thủ công',
}

const STATUS_EXPORT_LABEL: Record<string, string> = {
  completed: 'Hoàn thành',
  pending: 'Chưa thanh toán',
  refunded: 'Hoàn tiền',
}

// Default range = tháng hiện tại [first day, last day].
function currentMonthRange(): { month: string; from: string; to: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const first = new Date(Date.UTC(y, m, 1))
  const last = new Date(Date.UTC(y, m + 1, 0))
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return {
    month: `${y}-${String(m + 1).padStart(2, '0')}`,
    from: fmt(first),
    to: fmt(last),
  }
}

const RANGE = currentMonthRange()

const DEFAULT_FILTERS: PaymentFilters = {
  from: RANGE.from,
  to: RANGE.to,
  course: '',
  status: '',
  page: 1,
  limit: 20,
}

export function FinancePage() {
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_FILTERS)
  const [exporting, setExporting] = useState(false)
  const pushToast = useToastStore((s) => s.push)
  const { data: summary, isLoading: loadingSummary } = useFinanceSummary(RANGE.month)
  const { data: paymentsData, isLoading: loadingPayments, isError, error, refetch } = usePayments(filters)

  const payments = paymentsData?.data ?? []

  const handleExport = async () => {
    setExporting(true)
    try {
      // Lấy TẤT CẢ giao dịch khớp bộ lọc hiện tại (bỏ qua phân trang).
      const params = new URLSearchParams()
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      if (filters.course) params.set('course', filters.course)
      if (filters.status) params.set('status', filters.status)
      if (filters.q) params.set('q', filters.q)
      params.set('limit', '10000')
      params.set('page', '1')

      const res = await api.getRaw<Paginated<Payment>>(`/crm/payments?${params}`)
      const rows = res.data

      if (rows.length === 0) {
        pushToast({ type: 'warn', title: 'Không có dữ liệu để xuất', body: 'Bộ lọc hiện tại không có giao dịch nào.' })
        return
      }

      const headers = [
        'Học viên', 'Email', 'Số điện thoại', 'Telegram',
        'Khóa', 'Số tiền (VND)', 'Phương thức', 'Trạng thái',
        'Ngày thanh toán', 'Cổng thanh toán',
      ]
      const csvRows = rows.map((p) => [
        p.contact_name,
        p.contact_email ?? '',
        p.contact_phone ?? '',
        p.contact_telegram ?? '',
        p.course_name,
        p.amount,
        p.method ? METHOD_EXPORT_LABEL[p.method] ?? p.method : '',
        STATUS_EXPORT_LABEL[p.status] ?? p.status,
        p.paid_at ? formatDateVN(p.paid_at, { withYear: true }) : '',
        p.gateway ? GATEWAY_EXPORT_LABEL[p.gateway] ?? p.gateway : '',
      ])

      const stamp = new Date().toISOString().slice(0, 10)
      exportToCsv(`giao-dich-${stamp}.csv`, headers, csvRows)
      pushToast({ type: 'success', title: 'Đã xuất Excel', body: `${rows.length} giao dịch theo bộ lọc hiện tại.` })
    } catch (e) {
      pushToast({
        type: 'error',
        title: 'Xuất Excel thất bại',
        body: e instanceof Error ? e.message : 'Lỗi không xác định.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">💰 Tài chính</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Tổng quan thanh toán — dữ liệu đồng bộ từ payment gateway.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Đang xuất...' : '⬇ Xuất Excel'}
        </Button>
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
