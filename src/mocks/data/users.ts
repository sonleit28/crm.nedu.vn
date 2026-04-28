import type { AuthUser } from '@shared/types/auth'

export const MOCK_USERS: ReadonlyArray<AuthUser> = [
  {
    id: 'u_founder',
    email: 'nhi@nedu.vn',
    name: 'Lê Thảo Nhi',
    avatar_url: '',
    role: 'founder',
  },
  {
    id: 'u_admin',
    email: 'admin@nedu.vn',
    name: 'Admin Demo',
    role: 'admin',
  },
  {
    id: 'u_consultant_minhtam',
    email: 'minhtam@nedu.vn',
    name: 'Minh Tâm',
    role: 'consultant',
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
