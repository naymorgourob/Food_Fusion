import { getUserById } from '../services/auth.service.js'
import { updateProfile, changePassword } from '../services/profile.service.js'
import { validateProfileUpdate, validateChangePassword } from '../validators/profile.validator.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

// req.user is set by the authenticateUser middleware from the JWT payload
// (just { id, role }) — fetched fresh from the database here so the
// response always reflects current data (e.g. a name change), not
// whatever was true when the token was issued.
export async function getMe(req, res) {
  const user = await getUserById(req.user.id)
  sendSuccess(res, { message: 'Current user fetched successfully.', data: { user } })
}

export async function putProfile(req, res) {
  const errors = validateProfileUpdate(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const user = await updateProfile(req.user.id, req.body, req.file)
  sendSuccess(res, { message: 'Profile updated successfully.', data: { user } })
}

export async function putChangePassword(req, res) {
  const errors = validateChangePassword(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  await changePassword(req.user.id, req.body)
  sendSuccess(res, { message: 'Password changed successfully.' })
}
