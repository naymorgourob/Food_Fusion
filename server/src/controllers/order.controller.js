import { validateOrder, validateStatus, validateEstimatedTime } from '../validators/order.validator.js'
import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  assignStaff,
  updateEstimatedTimes,
  listAssignableStaff,
} from '../services/order.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getOrders(req, res) {
  const orders = await listOrders(req.user)
  sendSuccess(res, { message: 'Orders fetched successfully.', data: { orders } })
}

export async function getOrder(req, res) {
  const order = await getOrderById(req.user, req.params.id)
  sendSuccess(res, { message: 'Order fetched successfully.', data: { order } })
}

export async function getAssignableStaff(req, res) {
  const staff = await listAssignableStaff()
  sendSuccess(res, { message: 'Assignable staff fetched successfully.', data: { staff } })
}

export async function postOrder(req, res) {
  const input = { ...req.body, paymentProofImage: req.file?.filename }
  if (typeof input.items === 'string') {
    try {
      input.items = JSON.parse(input.items)
    } catch {
      throw new ApiError(400, 'Order items must be valid JSON.')
    }
  }
  const errors = validateOrder({ ...input, requirePaymentProof: req.user.role === 'CUSTOMER' })
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const customerId = req.user.role !== 'CUSTOMER' && req.body.customerId ? req.body.customerId : req.user.id
  const order = await createOrder(customerId, input)
  sendSuccess(res, { statusCode: 201, message: 'Order placed successfully.', data: { order } })
}

export async function putOrderStatus(req, res) {
  const errors = validateStatus(req.body.status)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const order = await updateOrderStatus(req.params.id, req.body.status, req.user)
  sendSuccess(res, { message: 'Order status updated successfully.', data: { order } })
}

export async function patchAssignStaff(req, res) {
  const order = await assignStaff(req.params.id, req.body.staffId)
  sendSuccess(res, { message: 'Staff assignment updated successfully.', data: { order } })
}

export async function patchEstimatedTime(req, res) {
  const errors = validateEstimatedTime(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const order = await updateEstimatedTimes(req.params.id, req.body)
  sendSuccess(res, { message: 'Estimated time updated successfully.', data: { order } })
}

export async function removeOrder(req, res) {
  const order = await cancelOrder(req.user, req.params.id)
  sendSuccess(res, { message: 'Order cancelled successfully.', data: { order } })
}
