export type UserRole = 'patient' | 'doctor' | 'donor' | 'organization' | 'admin'

export interface AuthUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  phone_number?: string
  address?: string
  is_verified: boolean
  doctor_profile?: {
    license_number: string
    license_document?: string
    specialization: string
    hospital_name: string
    is_approved: boolean
  } | null
  organization_profile?: {
    org_name: string
    registration_number: string
    website: string
    is_approved: boolean
  } | null
}

export interface AuthSession {
  access: string
  refresh: string
  user: AuthUser
}

const AUTH_STORAGE_KEY = 'lifeaid_auth_session'

export function saveAuthSession(session: AuthSession) {
  console.log('Saving auth session:', { access: session.access?.substring(0, 20) + '...', user: session.user?.email })
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    console.log('No auth session found in localStorage')
    return null
  }

  try {
    const session = JSON.parse(raw) as AuthSession
    console.log('Retrieved auth session:', { hasAccess: !!session.access, email: session.user?.email })
    return session
  } catch {
    console.log('Failed to parse auth session')
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAccessToken() {
  return getAuthSession()?.access ?? null
}

export function getCurrentUser() {
  return getAuthSession()?.user ?? null
}

export function getDisplayName(user?: Partial<AuthUser> | null) {
  if (!user) return 'Guest'
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.username || user.email || 'Guest'
}

export function getRoleHomePath(role?: UserRole | null) {
  switch (role) {
    case 'patient':
      return '/patient-dashboard'
    case 'doctor':
      return '/doctor-dashboard'
    case 'donor':
      return '/donor-dashboard'
    case 'organization':
      return '/organization-dashboard'
    case 'admin':
      return '/admin-dashboard'
    default:
      return '/login'
  }
}
