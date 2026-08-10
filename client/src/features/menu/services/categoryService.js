import { api } from '@/services/api'

export async function fetchCategories(search) {
  const { data } = await api.get('/menu/categories', { params: { search: search || undefined } })
  return data.data.categories
}

export async function createCategory(payload) {
  const { data } = await api.post('/menu/categories', payload)
  return data.data.category
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/menu/categories/${id}`, payload)
  return data.data.category
}

export async function deleteCategory(id) {
  await api.delete(`/menu/categories/${id}`)
}
