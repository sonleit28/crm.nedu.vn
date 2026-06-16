import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@shared/config/query-client'
import { AppLayout } from '@shared/components/layout/AppLayout'
import { RouteTracker } from '@shared/analytics/RouteTracker'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGate, HomeRedirect, BlockFinanceViewer } from './RoleGate'
import { FINANCE_ROLES } from '@shared/types/auth'
import { LoginPage } from '@modules/auth/pages/LoginPage'
import { AuthCallbackPage } from '@modules/auth/pages/AuthCallbackPage'
import { DashboardPage } from '@modules/dashboard/pages/DashboardPage'
import { PipelinePage } from '@modules/pipeline/pages/PipelinePage'
import { ContactsPage } from '@modules/contacts/pages/ContactsPage'
import { FinancePage } from '@modules/finance/pages/FinancePage'
import { AnalyticsPage } from '@modules/analytics/pages/AnalyticsPage'
import { NotificationsPage } from '@modules/notifications/pages/NotificationsPage'

const ADMIN_FOUNDER = ['founder', 'admin'] as const

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomeRedirect />} />

              {/* Workbench chung — finance-only viewer bị đẩy về /finance */}
              <Route element={<BlockFinanceViewer />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pipeline" element={<PipelinePage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Admin/Founder only */}
                <Route element={<RoleGate allow={ADMIN_FOUNDER} />}>
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
              </Route>

              {/* Finance — admin/founder/owner + crm_finance_viewer */}
              <Route element={<RoleGate allow={FINANCE_ROLES} />}>
                <Route path="/finance" element={<FinancePage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 → role-aware home */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
