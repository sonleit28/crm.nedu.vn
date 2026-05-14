export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export interface Paginated<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

/**
 * CRM list endpoints (e.g. /api/crm/contacts) trả về envelope khác:
 *   { data, pagination: { page, size, total }, meta: { unresolved_count } }
 * Per NLH-NEDU-CRM-MVP1-001 §6.2 — locked với BE.
 *
 * Khác `Paginated<T>` ở:
 * - pagination (not meta) cho page/size/total
 * - meta carries domain-specific info (unresolved_count cho CRM)
 * - `size` thay vì `limit` (snake_case + closer to OpenAPI convention)
 */
export interface CrmPaginatedResponse<T, M = Record<string, unknown>> {
  data: T[]
  pagination: { page: number; size: number; total: number }
  meta: M
}
