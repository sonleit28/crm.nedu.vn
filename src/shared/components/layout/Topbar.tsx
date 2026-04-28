import { useLocation } from 'react-router-dom'

const PAGE_META: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Tổng quan / Dashboard' },
  '/pipeline': { title: 'Pipeline Kanban', breadcrumb: 'Tổng quan / Pipeline' },
  '/contacts': { title: 'Contacts', breadcrumb: 'Tổng quan / Contacts' },
  '/finance': { title: 'Tài chính', breadcrumb: 'Tài chính / Tổng quan' },
  '/overdue': { title: 'Thanh toán quá hạn', breadcrumb: 'Tài chính / Quá hạn' },
  '/analytics': { title: 'Analytics', breadcrumb: 'Phân tích / Analytics' },
}

export function Topbar() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] ?? { title: 'CRM', breadcrumb: '' }

  return (
    <header
      className="sticky top-0 z-30 h-[56px] bg-bg2/80 backdrop-blur border-b border-border flex items-center gap-4 px-6"
      aria-label="Topbar"
    >
      <div className="flex flex-col leading-tight">
        <div className="text-[16px] font-bold text-text">{meta.title}</div>
        {meta.breadcrumb && (
          <div className="text-[11px] text-text3">{meta.breadcrumb}</div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <input
          type="search"
          placeholder="Tìm contact, học viên, lead..."
          disabled
          className="w-[240px] h-9 px-3 rounded-r bg-card2 border border-border text-[12px] text-text2 placeholder:text-text3 disabled:cursor-not-allowed"
          title="Phase 2"
        />
        <button
          type="button"
          className="w-9 h-9 grid place-items-center rounded-r bg-card2 border border-border text-text2 hover:text-text"
          aria-label="Settings"
          title="Phase 2"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
