import { api } from '@/services/api'

export async function fetchPayroll(period) {
  const { data } = await api.get('/payroll', { params: { period } })
  return data.data
}

export async function updateSalary(staffId, monthlySalary) {
  const { data } = await api.put(`/payroll/staff/${staffId}/salary`, { monthlySalary })
  return data.data.staff
}

export async function recordSalaryPayment(payload) {
  const { data } = await api.post('/payroll/payments', payload)
  return data.data.payment
}

export async function removeSalaryPayment(id) {
  await api.delete(`/payroll/payments/${id}`)
}

export async function fetchMyPayslips() {
  const { data } = await api.get('/payroll/mine')
  return data.data
}
