import { useState } from 'react'
import { useContacts } from '@modules/contacts/hooks/useContacts'
import type { ContactFilters } from '@modules/contacts/hooks/useContacts'
import { ContactsTable } from '@modules/contacts/components/ContactsTable'
import { ContactsFilterBar } from '@modules/contacts/components/ContactsFilterBar'
import { ContactDetailModal } from '@modules/contacts/components/ContactDetailModal'
import { AddContactModal } from '@modules/contacts/components/AddContactModal'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'

const DEFAULT_FILTERS: ContactFilters = {
  q: '',
  source: '',
  course: '',
  tier: '',
  limit: 20,
  page: 1,
}

export function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading, isError, error } = useContacts(filters)

  const contacts = data?.data ?? []
  const total = data?.meta.total ?? 0

  const updateFilters = (patch: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-text">Khách hàng</h1>
          <p className="text-[12px] text-text2 mt-0.5">
            Hồ sơ học viên · Click "Chi tiết" để xem thêm thông tin.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddOpen(true)}
        >
          ＋ Thêm khách hàng
        </Button>
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
