import { prisma } from '../config/prisma.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'

// Fields safe to send to the client — password is never selected here in
// the first place, rather than fetched and stripped afterwards.
const PUBLIC_USER_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  profileImage: true,
  isActive: true,
  createdAt: true,
}

export async function registerCustomer({ fullName, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new ApiError(409, 'An account with this email already exists.')

  const hashedPassword = await hashPassword(password)

  // role is never taken from the request body — public registration can
  // only ever create a CUSTOMER. Admin/Staff accounts are created directly
  // in the database or by Admin-only functionality added in a later part.
  const user = await prisma.user.create({
    data: { fullName, email, phone, password: hashedPassword, role: 'CUSTOMER' },
    select: PUBLIC_USER_FIELDS,
  })

  const token = generateToken({ id: user.id, role: user.role })
  return { user, token }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Same message whether the email doesn't exist or the password is wrong —
  // telling them apart would let an attacker discover which emails are
  // registered.
  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password.')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated.')
  }

  const token = generateToken({ id: user.id, role: user.role })
  const { password: _password, ...publicUser } = user
  return { user: publicUser, token }
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS })
  if (!user) throw new ApiError(404, 'User not found.')
  return user
}
