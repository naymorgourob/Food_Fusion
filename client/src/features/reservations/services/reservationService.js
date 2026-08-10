import { api } from '@/services/api'

// Same endpoint for both roles — the response is scoped server-side
// (Admin: all, Customer: own) by reservation.service.js on the backend.
export async function fetchReservations() {
  const { data } = await api.get('/reservations')
  return data.data.reservations
}

export async function createReservation(payload) {
  const { data } = await api.post('/reservations', payload)
  return data.data.reservation
}

export async function updateReservationStatus(id, status) {
  const { data } = await api.put(`/reservations/${id}`, { status })
  return data.data.reservation
}

export async function cancelReservation(id) {
  const { data } = await api.delete(`/reservations/${id}`)
  return data.data.reservation
}
