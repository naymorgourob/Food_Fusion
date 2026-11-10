import { api } from '@/services/api'

export async function fetchSettings() {
  const { data } = await api.get('/settings')
  return data.data.settings
}

export async function fetchPaymentContact() {
  const { data } = await api.get('/settings/payment-contact')
  return data.data
}

export async function updateSettings(payload) {
  const { data } = await api.put('/settings', payload)
  return data.data.settings
}

// Public — open/closed right now, today's hours, and whether Admin closed early.
export async function fetchRestaurantStatus() {
  const { data } = await api.get('/settings/status')
  return data.data.status
}

// Admin only. true closes for the rest of today, false reopens.
export async function updateRestaurantStatus(closedToday) {
  const { data } = await api.put('/settings/status', { closedToday })
  return data.data.status
}
