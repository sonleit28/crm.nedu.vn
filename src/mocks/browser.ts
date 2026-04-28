import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'
import { leadsHandlers } from './handlers/leads'
import { contactsHandlers } from './handlers/contacts'
import { paymentsHandlers } from './handlers/payments'
import { sseOverdueHandlers } from './handlers/sse-overdue'
import { dashboardHandlers } from './handlers/dashboard'
import { analyticsHandlers } from './handlers/analytics'

export const worker = setupWorker(
  ...authHandlers,
  ...leadsHandlers,
  ...contactsHandlers,
  ...paymentsHandlers,
  ...sseOverdueHandlers,
  ...dashboardHandlers,
  ...analyticsHandlers,
)
