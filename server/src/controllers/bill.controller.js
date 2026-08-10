import { validateGenerateBill, validatePaymentStatus } from '../validators/bill.validator.js'
import { listBills, getBillById, generateBill, updatePaymentStatus } from '../services/bill.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getBills(req, res) {
  const bills = await listBills(req.user)
  sendSuccess(res, { message: 'Bills fetched successfully.', data: { bills } })
}

export async function getBill(req, res) {
  const bill = await getBillById(req.user, req.params.id)
  sendSuccess(res, { message: 'Bill fetched successfully.', data: { bill } })
}

export async function postBill(req, res) {
  const errors = validateGenerateBill(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const bill = await generateBill(req.body)
  sendSuccess(res, { statusCode: 201, message: 'Bill generated successfully.', data: { bill } })
}

export async function putBillPaymentStatus(req, res) {
  const errors = validatePaymentStatus(req.body.paymentStatus)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const bill = await updatePaymentStatus(req.params.id, req.body.paymentStatus)
  sendSuccess(res, { message: 'Payment status updated successfully.', data: { bill } })
}
