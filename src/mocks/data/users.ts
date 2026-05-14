import type { AuthUser } from '@shared/types/auth'

// Mock users — shape khớp BE /api/auth/me response (full_name + roles[]).
export const MOCK_USERS: ReadonlyArray<AuthUser> = [
  {
    id: 'u_founder',
    email: 'nhi@nedu.vn',
    full_name: 'Lê Thảo Nhi',
    avatar_url: null,
    roles: ['founder'],
  },
  {
    id: 'u_admin',
    email: 'admin@nedu.vn',
    full_name: 'Admin Demo',
    avatar_url: null,
    roles: ['admin'],
  },
  {
    id: 'u_consultant_minhtam',
    email: 'minhtam@nedu.vn',
    full_name: 'Minh Tâm',
    avatar_url: null,
    roles: ['consultant'],
  },
] as const

export const DEFAULT_MOCK_ID = 'u_admin'

export function findMockUserById(id: string | null | undefined): AuthUser | undefined {
  if (!id) return undefined
  return MOCK_USERS.find((u) => u.id === id)
}

export function getCurrentMockUser(): AuthUser | undefined {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('mock_uid') : null
  return findMockUserById(stored ?? DEFAULT_MOCK_ID)
}
