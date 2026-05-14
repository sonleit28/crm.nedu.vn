import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@shared/config/query-client'
import { AppLayout } from '@shared/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGate } from './RoleGate'
import { LoginPage } from '@modules/auth/pages/LoginPage'
import { AuthCallbackPage } from '@modules/auth/pages/AuthCallbackPage'
import { DashboardPage } from '@modules/dashboard/pages/DashboardPage'
import { PipelinePage } from '@modules/pipeline/pages/PipelinePage'
import { ContactsPage } from '@modules/contacts/pages/ContactsPage'
import { FinancePage } from '@modules/finance/pages/FinancePage'
import { AnalyticsPage } from '@modules/analytics/pages/AnalyticsPage'

const ADMIN_FOUNDER = ['founder', 'admin'] as const

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/contacts" element={<ContactsPage />} />

              {/* Admin/Founder only */}
              <Route element={<RoleGate allow={ADMIN_FOUNDER} />}>
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 → dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
