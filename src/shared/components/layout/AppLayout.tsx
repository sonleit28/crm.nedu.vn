import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastStack } from '@shared/components/ui/ToastStack'
import { useOverdueSSE } from '@shared/hooks/useOverdueSSE'

export function AppLayout() {
  // Subscribe SSE overdue → push toasts + bump sidebar badge.
  // Mount tại layout (persistent across protected routes), unmount khi logout.
  useOverdueSSE()

  return (
    <div className="min-h-screen bg-bg text-text">
      <Sidebar />
      <div className="ml-[240px] min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <ToastStack />
    </div>
  )
}
