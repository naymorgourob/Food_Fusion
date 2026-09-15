import { api } from '@/services/api'

export async function fetchMenuItems(params) {
  const { data } = await api.get('/menu/items', { params })
  return data.data // { items, pagination }
}

export async function fetchMenuItemById(id) {
  const { data } = await api.get(`/menu/items/${id}`)
  return data.data.food
}

// Always sent as multipart/form-data — matches the multer.single('image')
// middleware on the server regardless of whether a new photo is attached
// (editing without changing the photo just omits the `image` field).
function buildFormData({ name, description, price, prepTimeMinutes, isAvailable, categoryId }, imageFile) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description ?? '')
  formData.append('price', price)
  formData.append('prepTimeMinutes', prepTimeMinutes ?? '')
  formData.append('isAvailable', String(isAvailable))
  formData.append('categoryId', categoryId)
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export async function createMenuItem(payload, imageFile) {
  const { data } = await api.post('/menu/items', buildFormData(payload, imageFile))
  return data.data.food
}

export async function updateMenuItem(id, payload, imageFile) {
  const { data } = await api.put(`/menu/items/${id}`, buildFormData(payload, imageFile))
  return data.data.food
}

export async function deleteMenuItem(id) {
  await api.delete(`/menu/items/${id}`)
}
