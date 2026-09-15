import { api } from '@/services/api'

export async function fetchTables(params) {
  const { data } = await api.get('/tables', { params })
  return data.data.tables
}

export async function createTable(payload) {
  const { data } = await api.post('/tables', payload)
  return data.data.table
}

export async function updateTable(id, payload) {
  const { data } = await api.put(`/tables/${id}`, payload)
  return data.data.table
}

export async function deleteTable(id) {
  await api.delete(`/tables/${id}`)
}
