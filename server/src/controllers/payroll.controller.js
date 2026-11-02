import { sendSuccess } from '../utils/ApiResponse.js'
import {
  getPayroll,
  setMonthlySalary,
  recordSalaryPayment,
  deleteSalaryPayment,
  listMySalaryPayments,
} from '../services/payroll.service.js'

function currentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function getPayrollHandler(req, res) {
  const payroll = await getPayroll(req.query.period || currentPeriod())
  sendSuccess(res, { message: 'Payroll fetched successfully.', data: payroll })
}

export async function putSalaryHandler(req, res) {
  const staff = await setMonthlySalary(req.params.staffId, req.body.monthlySalary)
  sendSuccess(res, { message: 'Salary updated.', data: { staff } })
}

export async function postSalaryPaymentHandler(req, res) {
  const payment = await recordSalaryPayment(req.user.id, req.body)
  sendSuccess(res, { statusCode: 201, message: 'Salary payment recorded.', data: { payment } })
}

export async function deleteSalaryPaymentHandler(req, res) {
  await deleteSalaryPayment(req.params.id)
  sendSuccess(res, { message: 'Salary payment removed.' })
}

export async function getMyPayslipsHandler(req, res) {
  const data = await listMySalaryPayments(req.user.id)
  sendSuccess(res, { message: 'Payslips fetched successfully.', data })
}
