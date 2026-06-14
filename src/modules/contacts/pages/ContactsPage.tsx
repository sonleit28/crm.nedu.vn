import { useState } from 'react'
import { useContacts } from '@modules/contacts/hooks/useContacts'
import type { ContactFilters, ContactsListResponse } from '@modules/contacts/hooks/useContacts'
import { ContactsTable } from '@modules/contacts/components/ContactsTable'
import { ContactsFilterBar } from '@modules/contacts/components/ContactsFilterBar'
import { ContactDetailModal } from '@modules/contacts/components/ContactDetailModal'
import { AddContactModal } from '@modules/contacts/components/AddContactModal'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { api } from '@shared/config/api-client'
import { exportToCsv } from '@shared/utils/exportCsv'
import { sourceLabel } from '@shared/utils/enums'
import { useToastStore } from '@shared/stores/useToastStore'
import type { ContactTier } from '@shared/types/domain'

const DEFAULT_FILTERS: ContactFilters = {
  q: '',
  source: '',
  course: '',
  tier: '',
  size: 50,
  page: 1,
}

const TIER_EXPORT_LABEL: Record<ContactTier, string> = {
  diamond: 'Kim cương',
  gold: 'Vàng',
  silver: 'Bạc',
  newbie: 'Chưa phân loại',
}

export function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const pushToast = useToastStore((s) => s.push)

  const { data, isLoading, isError, error } = useContacts(filters)

  const contacts = data?.data ?? []
  const total = data?.pagination.total ?? 0

  const updateFilters = (patch: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const handleExport = async () => {
    setExporting(true)
    try {
      // Fetch ALL rows matching the current filter (ignore pagination).
      const params = new URLSearchParams()
      if (filters.q) params.set('q', filters.q)
      if (filters.source) params.set('source', filters.source)
      if (filters.course) params.set('course', filters.course)
      if (filters.tier) params.set('tier', filters.tier)
      params.set('size', '10000')
      params.set('page', '1')

      const res = await api.getRaw<ContactsListResponse>(`/crm/contacts?${params}`)
      const rows = res.data

      if (rows.length === 0) {
        pushToast({ type: 'warn', title: 'Không có dữ liệu để xuất', body: 'Bộ lọc hiện tại không có khách hàng nào.' })
        return
      }

      const headers = [
        'Họ tên', 'Email', 'Số điện thoại', 'Telegram',
        'Nguồn', 'Khóa đang học', 'Phân loại', 'Trạng thái thanh toán',
      ]
      const csvRows = rows.map((c) => [
        c.full_name,
        c.email ?? '',
        c.phone ?? '',
        c.telegram ?? '',
        sourceLabel(c.source),
        c.current_course ?? '',
        TIER_EXPORT_LABEL[c.tier],
        c.payment_status_label,
      ])

      const stamp = new Date().toISOString().slice(0, 10)
      exportToCsv(`khach-hang-${stamp}.csv`, headers, csvRows)
      pushToast({ type: 'success', title: 'Đã xuất Excel', body: `${rows.length} khách hàng theo bộ lọc hiện tại.` })
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
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">Khách hàng</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Hồ sơ học viên · Click "Chi tiết" để xem thêm thông tin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Đang xuất...' : '⬇ Xuất Excel'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddOpen(true)}
          >
            ＋ Thêm khách hàng
          </Button>
        </div>
      </header>

      {/* Filter bar */}
      <ContactsFilterBar
        filters={filters}
        total={total}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Table */}
      <div className="bg-card border border-border rounded-r2 overflow-hidden">
        {isError ? (
          <EmptyState
            icon="⚠️"
            title="Không tải được danh sách"
            sub={error instanceof Error ? error.message : 'Lỗi không xác định.'}
          />
        ) : (
          <ContactsTable
            contacts={contacts}
            isLoading={isLoading}
            onDetail={setSelectedId}
          />
        )}
      </div>

      <ContactDetailModal
        contactId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      <AddContactModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
