import { api } from '@/services/api'

// Both endpoints are Customer-only and scoped to the signed-in user
// server-side — there is no id to pass.
export async function fetchLoyaltySummary() {
  const { data } = await api.get('/loyalty/me')
  return data.data.summary
}

export async function fetchPointHistory() {
  const { data } = await api.get('/loyalty/me/transactions')
  return data.data.transactions
}
