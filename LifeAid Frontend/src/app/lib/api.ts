import { getAccessToken, getAuthSession, clearAuthSession, type AuthSession, type AuthUser } from './auth'

export interface MedicalCase {
  id: string
  patientName: string
  patientAge?: number | null
  diagnosis: string
  story: string
  targetAmount: number
  raisedAmount: number
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'funded'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  doctorVerified: boolean
  doctorComment?: string
  doctorName?: string
  dateCreated: string
  category: string
  location: string
  imageUrl?: string
  documentUrl?: string
}

export interface DonationItem {
  id: string
  caseId: string
  donorName: string
  amount: number
  date: string
  message?: string
}

export interface PublicStats {
  patientsHelped: number
  donationsCollected: number
  activeCases: number
  verifiedDoctors: number
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (authenticated) {
    const token = getAccessToken()
    console.log('Auth debug - Token:', token ? `present (${token.substring(0, 20)}...)` : 'MISSING')
    if (token) {
      if (token.startsWith('Token ') || token.startsWith('Bearer ')) {
        headers.set('Authorization', token)
      } else {
        headers.set('Authorization', `Bearer ${token}`)
      }
      console.log('Authorization header set')
    } else {
      console.warn('No auth token available for authenticated request to:', path)
    }
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const url = `${API_BASE_URL}${path}`
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers,
    })
  } catch (error) {
    console.error('Network error during fetch:', error)
    throw new ApiError(
      `Network error: Could not connect to the server at ${API_BASE_URL}. Please ensure the backend is running.`,
      0
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      console.error('Unauthorized request - session may be expired')
      // Only clear session if we're not already on a login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
        clearAuthSession()
      }
    }

    let message = `Request failed with status ${response.status}`

    if (typeof payload === 'object' && payload !== null) {
      if ('detail' in payload) {
        message = String(payload.detail)
      } else if ('message' in payload) {
        message = String(payload.message)
      } else {
        // Handle field-specific errors (common in 400 Bad Request)
        const fieldErrors = Object.entries(payload)
          .map(([field, errors]) => {
            const errorText = Array.isArray(errors) ? errors.join(', ') : String(errors)
            return `${field}: ${errorText}`
          })
          .join('; ')
        if (fieldErrors) message = fieldErrors
      }
    } else if (typeof payload === 'string' && payload.trim()) {
      message = payload
    }

    console.error('API request failed:', {
      method: init.method || 'GET',
      path,
      status: response.status,
      payload,
      message,
    })

    throw new ApiError(message, response.status)
  }

  return payload as T
}

function normalizeCase(item: any): MedicalCase {
  return {
    id: String(item.id),
    patientName: item.patient_name || item.patientName,
    patientAge: item.patient_age ?? item.patientAge ?? null,
    diagnosis: item.title || item.diagnosis || item.illness_type || item.category,
    story: item.description || item.story || '',
    targetAmount: Number(item.amount_required ?? item.targetAmount ?? 0),
    raisedAmount: Number(item.amount_raised ?? item.raisedAmount ?? 0),
    status: item.status,
    urgency: item.urgency,
    doctorVerified: Boolean(item.verified_by || item.doctorVerified || item.verified_by_name),
    doctorComment: item.doctor_remarks || item.doctorComment || '',
    doctorName: item.verified_by_name || item.doctorName || '',
    dateCreated: item.created_at || item.dateCreated || new Date().toISOString(),
    category: item.illness_type || item.category || '',
    location: item.location || '',
    imageUrl: item.image_url || item.imageUrl || undefined,
    documentUrl: item.document || item.documentUrl || item.image_url || item.imageUrl || undefined,
  }
}

function normalizeDonation(item: any): DonationItem {
  return {
    id: String(item.id),
    caseId: String(item.caseId || item.help_request?.id || item.help_request || ''),
    donorName: item.donorName || item.donor_display_name || item.donor_name || item.help_request?.patient_name || 'Donor',
    amount: Number(item.amount || 0),
    date: item.date || item.donated_at || item.donatedAt || new Date().toISOString(),
    message: item.message || '',
  }
}

export function buildUsername(name: string, email: string) {
  const emailPrefix = email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_')
  if (emailPrefix) return emailPrefix
  return name.toLowerCase().trim().replace(/\s+/g, '_') || `lifeaid_${Date.now()}`
}

export function splitName(name: string) {
  const parts = name.trim().split(/\s+/)
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' '),
  }
}

export async function login(email: string, password: string) {
  return apiFetch<AuthSession>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(normalizeAuthSession);
}

export async function logout() {
  const session = getAuthSession()
  if (session?.refresh) {
    try {
      await apiFetch('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: session.refresh }),
      }, true)
    } catch (error) {
      console.error('Logout failed on server:', error)
    }
  }
  clearAuthSession()
}

function normalizeAuthSession(data: any): AuthSession {
  const access = data.access || data.access_token || data.key || '';
  const refresh = data.refresh || data.refresh_token || '';
  
  if (!access && !refresh) {
    console.warn('No tokens in response:', data);
  }
  
  return {
    access,
    refresh,
    user: normalizeUser(data.user || data),
  }
}

function normalizeUser(data: any): AuthUser {
  if (!data) return null as any;
  return {
    id: data.id || 0,
    username: data.username || '',
    first_name: data.first_name || data.firstName || '',
    last_name: data.last_name || data.lastName || '',
    email: data.email || '',
    role: data.role || 'patient',
    phone_number: data.phone_number || data.phone,
    address: data.address || '',
    is_verified: data.is_verified || data.isVerified || false,
    doctor_profile: data.doctor_profile || null,
    organization_profile: data.organization_profile || null,
  };
}

export async function register(payload: {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: AuthUser['role']
}) {
  const { first_name, last_name } = splitName(payload.name)
  return apiFetch<AuthSession>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username: buildUsername(payload.name, payload.email),
      first_name,
      last_name,
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirmPassword,
      role: payload.role,
      phone_number: payload.phone,
      address: '',
    }),
  }).then(normalizeAuthSession);
}

export async function fetchProfile() {
  const result = await apiFetch<AuthUser>('/api/auth/profile/', {}, true)
  return result
}

export async function updateProfile(payload: Partial<AuthUser>) {
  return apiFetch<{ message: string; user: AuthUser }>('/api/auth/profile/update/', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true)
}

export async function fetchPublicStats() {
  return apiFetch<PublicStats>('/api/public/stats/')
}

export async function fetchPublicRequests(query = '') {
  const data = await apiFetch<{ count: number; results: any[] }>(`/api/requests/filter/${query ? `?${query}` : ''}`)
  return {
    count: data.count,
    cases: data.results.map(normalizeCase),
  }
}

export async function fetchPublicRequestDetail(id: string) {
  let data: any
  try {
    data = await apiFetch<any>(`/api/requests/${id}/`)
  } catch (error) {
    const session = getAuthSession()
    if (session?.user?.role !== 'patient') {
      throw error
    }
    data = await apiFetch<any>(`/api/patient/request/${id}/`, {}, true)
  }

  return {
    case: normalizeCase(data),
    donations: Array.isArray(data.donations) ? data.donations.map(normalizeDonation) : [],
  }
}

export async function fetchDonorRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/donor/requests/', {}, true)
  return data.results.map(normalizeCase)
}

export async function fetchDonationHistory() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/donor/donations/history/', {}, true)
  return data.results.map((item) => ({
    ...normalizeDonation(item),
    helpRequest: item.help_request ? normalizeCase(item.help_request) : null,
  }))
}

export async function fetchPatientRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/patient/request/my-requests/', {}, true)
  return data.results.map(normalizeCase)
}

export async function createPatientRequest(payload: FormData) {
  return apiFetch<any>('/api/patient/request/create/', {
    method: 'POST',
    body: payload,
  }, true)
}

export async function uploadPatientDocument(requestId: string, document: File) {
  const formData = new FormData()
  formData.append('document', document)
  return apiFetch<any>(`/api/patient/request/${requestId}/upload-document/`, {
    method: 'POST',
    body: formData,
  }, true)
}

export async function fetchDoctorPendingRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/doctor/requests/pending/', {}, true)
  return data.results.map(normalizeCase)
}

export async function fetchDoctorVerifiedRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/doctor/requests/verified/', {}, true)
  return data.results.map(normalizeCase)
}

export async function verifyDoctorRequest(id: string, action: 'approve' | 'reject', doctor_remarks: string) {
  return apiFetch(`/api/doctor/requests/${id}/verify/`, {
    method: 'PUT',
    body: JSON.stringify({ action, doctor_remarks }),
  }, true)
}

export async function submitDoctorProfile(payload: {
  license_number?: string
  specialization?: string
  hospital_name?: string
  license_document?: File | null
}) {
  const formData = new FormData()
  const licenseNumber = payload.license_number?.trim()
  const specialization = payload.specialization?.trim()
  const hospitalName = payload.hospital_name?.trim()

  if (licenseNumber) {
    formData.append('license_number', licenseNumber)
  }
  if (specialization) {
    formData.append('specialization', specialization)
  }
  if (hospitalName) {
    formData.append('hospital_name', hospitalName)
  }
  if (payload.license_document) {
    formData.append('license_document', payload.license_document)
  }

  return apiFetch('/api/doctor/profile/', {
    method: 'POST',
    body: formData,
  }, true)
}

export async function fetchNotifications() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/notifications/all/', {}, true)
  return data.results
}

export async function markNotificationRead(id: string) {
  return apiFetch(`/api/notifications/mark-read/${id}/`, { method: 'POST' }, true)
}

export async function fetchAdminSummary() {
  return apiFetch<any>('/api/dashboard/admin/', {}, true)
}

export async function fetchAdminRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/admin/requests/', {}, true)
  return data.results.map(normalizeCase)
}

export async function fetchAdminUsers(role?: string) {
  const url = role ? `/api/admin/users/?role=${role}` : '/api/admin/users/'
  const data = await apiFetch<{ count: number; results: any[] }>(url, {}, true)
  return data.results.map(normalizeUser)
}

export async function approveUser(id: number) {
  return apiFetch<{ message: string }>(`/api/admin/users/${id}/approve/`, {
    method: 'PUT',
  }, true)
}

export async function fetchReports() {
  const [donations, cases] = await Promise.all([
    apiFetch<any>('/api/dashboard/analytics/donations/', {}, true),
    apiFetch<any>('/api/dashboard/analytics/cases/', {}, true),
  ])
  return { donations, cases }
}

export async function fetchOrgRequests() {
  const data = await apiFetch<{ count: number; results: any[] }>('/api/org/requests/', {}, true)
  return data.results.map(normalizeCase)
}

export async function fetchOrgAnalytics() {
  return apiFetch<{ total_donated: number; cases_helped: number }>('/api/org/donations/analytics/', {}, true)
}

export async function submitOrganizationProfile(payload: {
  org_name: string
  registration_number: string
  website?: string
}) {
  return apiFetch<{ message: string; profile: AuthUser['organization_profile'] }>('/api/org/profile/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true)
}

export async function initiateDonation(payload: { help_request_id: string; amount: number; message?: string }) {
  return apiFetch<{ message: string; donation_id: number; order: any }>('/api/donor/donate/initiate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true)
}

export async function verifyDonation(payload: {
  donation_id: number
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  const data = await apiFetch<{ message: string; donation: any; case: any }>('/api/donor/donate/verify/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true)
  return {
    message: data.message,
    donation: normalizeDonation(data.donation),
    case: normalizeCase(data.case),
  }
}

export async function sendChatMessage(message: string, sessionId?: string | null) {
  return apiFetch<{ reply: string; status: string; duration_ms?: number }>('/api/chatbot/message/', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  })
}
