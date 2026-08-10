import { validateStaffCreate, validateStaffUpdate, validateActiveStatus } from '../validators/user.validator.js'
import {
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  setStaffActiveStatus,
} from '../services/staff.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getStaffList(req, res) {
  const staff = await listStaff()
  sendSuccess(res, { message: 'Staff fetched successfully.', data: { staff } })
}

export async function getStaffMember(req, res) {
  const staff = await getStaffById(req.params.id)
  sendSuccess(res, { message: 'Staff member fetched successfully.', data: { staff } })
}

export async function postStaff(req, res) {
  const errors = validateStaffCreate(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const staff = await createStaff(req.body)
  sendSuccess(res, { statusCode: 201, message: 'Staff account created successfully.', data: { staff } })
}

export async function putStaff(req, res) {
  const errors = validateStaffUpdate(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const staff = await updateStaff(req.params.id, req.body)
  sendSuccess(res, { message: 'Staff account updated successfully.', data: { staff } })
}

export async function patchStaffStatus(req, res) {
  const errors = validateActiveStatus(req.body.isActive)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const staff = await setStaffActiveStatus(req.params.id, req.body.isActive)
  sendSuccess(res, { message: 'Staff status updated successfully.', data: { staff } })
}
