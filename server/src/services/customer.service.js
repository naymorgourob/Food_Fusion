import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const CUSTOMER_LIST_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  profileImage: true,
  isActive: true,
  createdAt: true,
  _count: {
    select: {
      orders: true,
      reservations: true,
    },
  },
}

const CUSTOMER_DETAIL_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  profileImage: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
      reservations: true,
      favorites: true,
    },
  },
  orders: {
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      orderType: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  },
  reservations: {
    take: 5,
    orderBy: { reservationDate: 'desc' },
    select: {
      id: true,
      reservationDate: true,
      reservationTime: true,
      guestCount: true,
      status: true,
      table: {
        select: { number: true },
      },
    },
  },
  loyaltyTransactions: {
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      points: true,
      type: true,
      reason: true,
      createdAt: true,
    },
  },
}

// `role: CUSTOMER` filtered on every query here, including the by-id
// lookups below — this endpoint must never be able to fetch or toggle a
// Staff/Admin row just because the id happens to match.
async function getCustomerOrThrow(id) {
  const customer = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' }, select: CUSTOMER_LIST_SELECT })
  if (!customer) throw new ApiError(404, 'Customer not found.')
  return customer
}

export async function listCustomers() {
  return prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: CUSTOMER_LIST_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCustomerById(id) {
  const customer = await prisma.user.findFirst({
    where: { id, role: 'CUSTOMER' },
    select: CUSTOMER_DETAIL_SELECT,
  })
  if (!customer) throw new ApiError(404, 'Customer not found.')
  return customer
}

// Deactivating is not deleting — the spec is explicit that customers can
// never be deleted, only have login access switched off (isActive is
// already what auth.service.js's loginUser checks on every sign-in).
export async function setCustomerActiveStatus(id, isActive) {
  await getCustomerOrThrow(id)
  return prisma.user.update({ where: { id }, data: { isActive }, select: CUSTOMER_LIST_SELECT })
}
