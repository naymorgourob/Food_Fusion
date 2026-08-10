import { api } from '@/services/api'

// Same endpoint for every role — the response is scoped server-side
// (Admin/Staff: all, Customer: own) by order.service.js on the backend.
export async function fetchOrders() {
  const { data } = await api.get('/orders')
  return data.data.orders
}

export async function fetchOrderById(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data.data.order
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data.data.order
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.put(`/orders/${id}`, { status })
  return data.data.order
}

export async function cancelOrder(id) {
  const { data } = await api.delete(`/orders/${id}`)
  return data.data.order
}

export async function fetchAssignableStaff() {
  const { data } = await api.get('/orders/assignable-staff')
  return data.data.staff
}

export async function assignStaff(id, staffId) {
  const { data } = await api.patch(`/orders/${id}/assign-staff`, { staffId })
  return data.data.order
}

export async function updateEstimatedTime(id, payload) {
  const { data } = await api.patch(`/orders/${id}/estimated-time`, payload)
  return data.data.order
}
