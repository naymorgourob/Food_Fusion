import { api } from '@/services/api'

export async function fetchInventoryItems() {
  const { data } = await api.get('/inventory')
  return data.data.items
}

export async function createInventoryItem(payload) {
  const { data } = await api.post('/inventory', payload)
  return data.data.item
}

export async function updateInventoryItem(id, payload) {
  const { data } = await api.put(`/inventory/${id}`, payload)
  return data.data.item
}

export async function updateInventoryStock(id, quantity) {
  const { data } = await api.patch(`/inventory/${id}/stock`, { quantity })
  return data.data.item
}

export async function recordInventoryUsage(id, payload) {
  const { data } = await api.post(`/inventory/${id}/usage`, payload)
  return data.data.usage
}

export async function deleteInventoryItem(id) {
  await api.delete(`/inventory/${id}`)
}
