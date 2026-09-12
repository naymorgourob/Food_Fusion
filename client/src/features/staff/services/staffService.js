import { api } from '@/services/api'

// The backend mounts this resource at /employees (scaffolded back in
// Part 8, before "Staff" was the settled UI term) — kept as-is rather than
// renamed, to avoid an unrelated route-rename in a part that isn't about
// routing.
export async function fetchStaff() {
  const { data } = await api.get('/employees')
  return data.data.staff
}

export async function fetchStaffById(id) {
  const { data } = await api.get(`/employees/${id}`)
  return data.data.staff
}

export async function createStaff(payload) {
  const { data } = await api.post('/employees', payload)
  return data.data.staff
}

export async function updateStaff(id, payload) {
  const { data } = await api.put(`/employees/${id}`, payload)
  return data.data.staff
}

export async function updateStaffStatus(id, isActive) {
  const { data } = await api.patch(`/employees/${id}/status`, { isActive })
  return data.data.staff
}
