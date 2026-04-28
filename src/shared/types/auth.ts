export type Role = 'founder' | 'admin' | 'consultant'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: Role
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}
