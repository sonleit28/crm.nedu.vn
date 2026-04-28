import { useRef } from 'react'
import { Select } from '@shared/components/ui/Select'
import type { ContactFilters } from '../hooks/useContacts'

const SOURCE_OPTIONS = [
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'google', label: 'Google' },
  { value: 'referral', label: 'Referral' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'organic', label: 'Organic' },
  { value: 'tiktok', label: 'TikTok' },
]

const COURSE_OPTIONS = [
  { value: 'Design Thinking B5', label: 'Design Thinking B5' },
  { value: 'Là Chính Mình B3', label: 'Là Chính Mình B3' },
  { value: 'Public Speaking B2', label: 'Public Speaking B2' },
  { value: 'Storytelling B4', label: 'Storytelling B4' },
]

const TIER_OPTIONS = [
  { value: 'diamond', label: '💎 Kim cương' },
  { value: 'gold', label: '🥇 Vàng' },
  { value: 'silver', label: '🥈 Bạc' },
  { value: 'newbie', label: '— Chưa phân loại' },
]

interface ContactsFilterBarProps {
  filters: ContactFilters
  total: number
  onChange: (patch: Partial<ContactFilters>) => void
  onReset: () => void
}

export function ContactsFilterBar({
  filters,
  total,
  onChange,
  onReset,
}: ContactsFilterBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange({ q: v, page: 1 }), 300)
  }

  const hasFilter =
    !!filters.q || !!filters.source || !!filters.course || !!filters.tier

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <input
        type="text"
        defaultValue={filters.q ?? ''}
        onChange={handleQ}
        placeholder="Tìm tên, SĐT, email..."
        className="h-9 px-3 rounded-r bg-card2 border border-border text-[13px] text-text placeholder:text-text3 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition w-56"
      />

      <Select
        value={filters.source ?? ''}
        onChange={(e) => onChange({ source: e.target.value, page: 1 })}
        options={SOURCE_OPTIONS}
        placeholder="Tất cả nguồn"
      />

      <Select
        value={filters.course ?? ''}
        onChange={(e) => onChange({ course: e.target.value, page: 1 })}
        options={COURSE_OPTIONS}
        placeholder="Tất cả khóa"
      />

      <Select
        value={filters.tier ?? ''}
        onChange={(e) => onChange({ tier: e.target.value, page: 1 })}
        options={TIER_OPTIONS}
        placeholder="Tất cả phân loại"
      />

      {hasFilter && (
        <button
          type="button"
          onClick={onReset}
          className="h-9 px-3 rounded-r text-[12px] text-text2 hover:text-text bg-card2 border border-border hover:border-accent/40 transition"
        >
          Đặt lại
        </button>
      )}

      <span className="ml-auto text-[11px] text-text3">
        <strong className="text-text">{total}</strong> kết quả
      </span>
    </div>
  )
}
