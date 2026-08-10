import { api } from '@/services/api'

// Same endpoint for every role — the response is scoped server-side
// (Admin/Staff: all, Customer: own) by bill.service.js on the backend.
export async function fetchBills() {
  const { data } = await api.get('/billing')
  return data.data.bills
}

export async function fetchBillById(id) {
  const { data } = await api.get(`/billing/${id}`)
  return data.data.bill
}

export async function generateBill(payload) {
  const { data } = await api.post('/billing', payload)
  return data.data.bill
}

export async function updatePaymentStatus(id, paymentStatus) {
  const { data } = await api.put(`/billing/${id}`, { paymentStatus })
  return data.data.bill
}
