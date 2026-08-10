import { api } from '@/services/api'

export async function fetchCustomers() {
  const { data } = await api.get('/customers')
  return data.data.customers
}

export async function fetchCustomerById(id) {
  const { data } = await api.get(`/customers/${id}`)
  return data.data.customer
}

export async function updateCustomerStatus(id, isActive) {
  const { data } = await api.patch(`/customers/${id}/status`, { isActive })
  return data.data.customer
}
