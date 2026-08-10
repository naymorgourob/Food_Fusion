import { validateRegister, validateLogin } from '../validators/auth.validator.js'
import { registerCustomer, loginUser } from '../services/auth.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

// Controllers only: read the request, call the service, shape the response.
// No business logic lives here — that's what auth.service.js is for.

export async function register(req, res) {
  const errors = validateRegister(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const { fullName, email, phone, password } = req.body
  const { user, token } = await registerCustomer({ fullName, email, phone, password })

  sendSuccess(res, { statusCode: 201, message: 'Account created successfully.', data: { user, token } })
}

export async function login(req, res) {
  const errors = validateLogin(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const { email, password } = req.body
  const { user, token } = await loginUser({ email, password })

  sendSuccess(res, { message: 'Logged in successfully.', data: { user, token } })
}
