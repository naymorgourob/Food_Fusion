import { api } from '@/services/api'

// Thin wrappers over the three auth endpoints — components never call
// `api` directly for these, so the URL paths exist in exactly one place.
export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data.data // unwrap { success, message, data } to just { user, token }
}

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data.data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/profile/me')
  return data.data.user
}
