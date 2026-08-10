import { prisma } from '../config/prisma.js'
import { hashPassword } from '../utils/password.js'
import { ApiError } from '../utils/ApiError.js'

const STAFF_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  position: true,
  isActive: true,
  createdAt: true,
}

// Check-first-then-DB-constraint-as-safety-net, same pattern as
// Category.name/Table.number — a friendly 409 instead of a raw P2002.
async function assertEmailIsAvailable(email, excludeId = null) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== excludeId) {
    throw new ApiError(409, 'An account with this email already exists.')
  }
}

// `role: STAFF` filtered here too, same reasoning as customer.service.js —
// this endpoint must never reach a Customer or Admin row.
async function getStaffOrThrow(id) {
  const staff = await prisma.user.findFirst({ where: { id, role: 'STAFF' }, select: STAFF_SELECT })
  if (!staff) throw new ApiError(404, 'Staff member not found.')
  return staff
}

export async function listStaff() {
  return prisma.user.findMany({
    where: { role: 'STAFF' },
    select: STAFF_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getStaffById(id) {
  return getStaffOrThrow(id)
}

// Admin sets the initial password directly (this is an internal staff
// account, not a public signup) — hashed the exact same way
// auth.service.js's registerCustomer does, via the one shared utility.
export async function createStaff({ fullName, email, phone, position, password }) {
  await assertEmailIsAvailable(email)
  const hashedPassword = await hashPassword(password)

  return prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email,
      phone: phone.trim(),
      position: position.trim(),
      password: hashedPassword,
      role: 'STAFF',
    },
    select: STAFF_SELECT,
  })
}

export async function updateStaff(id, { fullName, email, phone, position }) {
  await getStaffOrThrow(id)
  await assertEmailIsAvailable(email, id)

  return prisma.user.update({
    where: { id },
    data: { fullName: fullName.trim(), email, phone: phone.trim(), position: position.trim() },
    select: STAFF_SELECT,
  })
}

export async function setStaffActiveStatus(id, isActive) {
  await getStaffOrThrow(id)
  return prisma.user.update({ where: { id }, data: { isActive }, select: STAFF_SELECT })
}
