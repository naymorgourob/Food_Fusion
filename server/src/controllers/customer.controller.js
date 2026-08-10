import { validateActiveStatus } from '../validators/user.validator.js'
import { listCustomers, getCustomerById, setCustomerActiveStatus } from '../services/customer.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getCustomers(req, res) {
  const customers = await listCustomers()
  sendSuccess(res, { message: 'Customers fetched successfully.', data: { customers } })
}

export async function getCustomer(req, res) {
  const customer = await getCustomerById(req.params.id)
  sendSuccess(res, { message: 'Customer fetched successfully.', data: { customer } })
}

export async function patchCustomerStatus(req, res) {
  const errors = validateActiveStatus(req.body.isActive)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const customer = await setCustomerActiveStatus(req.params.id, req.body.isActive)
  sendSuccess(res, { message: 'Customer status updated successfully.', data: { customer } })
}
