import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const CUSTOMER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
}

// `role: CUSTOMER` filtered on every query here, including the by-id
// lookups below — this endpoint must never be able to fetch or toggle a
// Staff/Admin row just because the id happens to match.
async function getCustomerOrThrow(id) {
  const customer = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' }, select: CUSTOMER_SELECT })
  if (!customer) throw new ApiError(404, 'Customer not found.')
  return customer
}

export async function listCustomers() {
  return prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: CUSTOMER_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCustomerById(id) {
  return getCustomerOrThrow(id)
}

// Deactivating is not deleting — the spec is explicit that customers can
// never be deleted, only have login access switched off (isActive is
// already what auth.service.js's loginUser checks on every sign-in).
export async function setCustomerActiveStatus(id, isActive) {
  await getCustomerOrThrow(id)
  return prisma.user.update({ where: { id }, data: { isActive }, select: CUSTOMER_SELECT })
}
