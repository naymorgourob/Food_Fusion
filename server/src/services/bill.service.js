import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { ApiError } from '../utils/ApiError.js'
import { calculateBillTotals } from '../utils/billing.js'
import { getSettings } from './settings.service.js'

const CUSTOMER_SELECT = { id: true, fullName: true, email: true }

const BILL_INCLUDE = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customerId: true,
      customer: { select: CUSTOMER_SELECT },
    },
  },
}

async function getBillOrThrow(id) {
  const bill = await prisma.bill.findUnique({ where: { id }, include: BILL_INCLUDE })
  if (!bill) throw new ApiError(404, 'Bill not found.')
  return bill
}

// Admin/Staff see every bill; a Customer only ever sees their own, reached
// through the Order relation (Bill has no customerId of its own) — same
// enforced-from-req.user pattern as order.service.js.
export async function listBills(user) {
  const where = user.role === 'CUSTOMER' ? { order: { customerId: user.id } } : {}
  return prisma.bill.findMany({
    where,
    include: BILL_INCLUDE,
    orderBy: { billDate: 'desc' },
  })
}

// Same 404-not-403 privacy rule as Order: a Customer probing another
// customer's bill id can't distinguish "doesn't exist" from "not yours."
export async function getBillById(user, id) {
  const bill = await getBillOrThrow(id)
  if (user.role === 'CUSTOMER' && bill.order.customerId !== user.id) {
    throw new ApiError(404, 'Bill not found.')
  }
  return bill
}

export async function generateBill({ orderId, vatPercent, discount }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new ApiError(400, 'Selected order does not exist.')
  if (order.status !== 'COMPLETED') throw new ApiError(400, 'Only completed orders can be billed.')

  const existing = await prisma.bill.findUnique({ where: { orderId } })
  if (existing) throw new ApiError(409, 'This order has already been billed.')

  // Falls back to Settings' vatPercentage (Part 17) when Admin/Staff
  // doesn't override it per bill — closes the seam left open in Part 13.
  let vat
  if (vatPercent !== undefined && vatPercent !== null && vatPercent !== '') {
    vat = new Prisma.Decimal(vatPercent)
  } else {
    const settings = await getSettings()
    vat = settings.vatPercentage
  }
  const disc = new Prisma.Decimal(discount !== undefined && discount !== null && discount !== '' ? discount : 0)

  const subtotal = order.totalAmount
  const { vatAmount, grandTotal } = calculateBillTotals(subtotal, vat, disc)

  if (grandTotal.isNegative()) {
    throw new ApiError(400, 'Discount cannot exceed the order total plus VAT.')
  }

  return prisma.bill.create({
    data: {
      orderId,
      subtotal,
      vatPercent: vat,
      vatAmount,
      discount: disc,
      grandTotal,
    },
    include: BILL_INCLUDE,
  })
}

export async function updatePaymentStatus(id, paymentStatus) {
  await getBillOrThrow(id)
  return prisma.bill.update({
    where: { id },
    data: { paymentStatus },
    include: BILL_INCLUDE,
  })
}
