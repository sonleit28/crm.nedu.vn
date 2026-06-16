// Role names khớp với nedu-backend (iam roles + ops roles).
// BE returns array vì user có thể nhiều roles (vd: iam_manager + admin).
export type Role =
  | 'founder'
  | 'admin'
  | 'owner'
  | 'leader'
  | 'consultant'
  | 'iam_manager'
  | 'crm_finance_viewer'
  | string // catch-all cho roles BE thêm sau

// Shape khớp BE /api/auth/me response.data (per central-auth.controller.ts).
export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  roles: Role[]
}

// CRM admin / founder roles per backend assertCrmRole.
export const ADMIN_FOUNDER_ROLES = ['admin', 'founder', 'owner'] as const

export function hasAdminRole(user: AuthUser | null): boolean {
  if (!user) return false
  return user.roles.some((r) =>
    (ADMIN_FOUNDER_ROLES as readonly string[]).includes(r),
  )
}

// Read-only role chỉ được xem trang Finance (khớp BE crm-finance.controller).
export const FINANCE_VIEWER_ROLE = 'crm_finance_viewer'

// Roles được vào /finance: admin/founder/owner + finance viewer.
export const FINANCE_ROLES = [
  ...ADMIN_FOUNDER_ROLES,
  FINANCE_VIEWER_ROLE,
] as const

// Roles cấp quyền truy cập CRM ngoài trang Finance (full workbench hoặc
// pipeline/notifications). Nếu user có bất kỳ role nào ở đây → KHÔNG coi là
// finance-only, để không vô tình thu hẹp quyền sẵn có của họ.
const CRM_WORKBENCH_ROLES = [
  ...ADMIN_FOUNDER_ROLES,
  'leader',
  'consultant',
  'manager',
] as const

// User CHỈ có quyền xem Finance: có crm_finance_viewer và KHÔNG kèm role
// workbench nào khác. Dùng để giới hạn nav + redirect khỏi các trang khác.
// (admin/consultant + viewer → giữ quyền gốc, không bị khoá về Finance.)
export function isFinanceViewerOnly(user: AuthUser | null): boolean {
  if (!user) return false
  if (!user.roles.includes(FINANCE_VIEWER_ROLE)) return false
  return !user.roles.some((r) =>
    (CRM_WORKBENCH_ROLES as readonly string[]).includes(r),
  )
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}
