// Role names khớp với nedu-backend (iam roles + ops roles).
// BE returns array vì user có thể nhiều roles (vd: iam_manager + admin).
export type Role =
  | 'founder'
  | 'admin'
  | 'owner'
  | 'leader'
  | 'consultant'
  | 'iam_manager'
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

export interface TokenPair {
  access_token: string
  refresh_token: string
}
