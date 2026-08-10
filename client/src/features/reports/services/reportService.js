import { api } from '@/services/api'

export async function fetchDashboardStats() {
  const { data } = await api.get('/reports/dashboard-stats')
  return data.data.stats
}

export async function fetchOrdersSummary(params) {
  const { data } = await api.get('/reports/orders-summary', { params })
  return data.data.summary
}

export async function fetchReservationsSummary(params) {
  const { data } = await api.get('/reports/reservations-summary', { params })
  return data.data.summary
}

export async function fetchRevenueSummary(params) {
  const { data } = await api.get('/reports/revenue-summary', { params })
  return data.data.summary
}
