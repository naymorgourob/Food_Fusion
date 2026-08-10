import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { resolveDateRange, buildTimeSeries } from '../utils/reportFilters.js'

const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

export async function getDashboardStats() {
  const [totalCustomers, totalStaff, totalMenuItems, totalOrders, totalReservations, totalInventoryItems, paidBills] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'STAFF' } }),
      prisma.food.count(),
      prisma.order.count(),
      prisma.reservation.count(),
      prisma.inventoryItem.count(),
      prisma.bill.findMany({ where: { paymentStatus: 'PAID' }, select: { grandTotal: true } }),
    ])

  // Decimal accumulation, same reasoning as bill.service.js's
  // calculateBillTotals — exact money math even for a read-only total.
  const totalRevenue = paidBills
    .reduce((sum, bill) => sum.add(bill.grandTotal), new Prisma.Decimal(0))
    .toNumber()

  return {
    totalCustomers,
    totalStaff,
    totalMenuItems,
    totalOrders,
    totalReservations,
    totalInventoryItems,
    totalRevenue,
  }
}

// Serves both "Daily Orders" (pass month) and "Monthly Orders" (omit it) —
// see reportFilters.js for how the granularity is picked.
export async function getOrdersSummary({ date, month, year }) {
  const { start, end, granularity } = resolveDateRange({ date, month, year })

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    select: { createdAt: true, totalAmount: true },
  })

  const series = buildTimeSeries(orders, granularity, { dateField: 'createdAt', amountField: 'totalAmount' }).map(
    (bucket) => ({ label: bucket.label, orderCount: bucket.count, orderValue: bucket.amount }),
  )

  return {
    granularity,
    totalOrders: orders.length,
    totalOrderValue: series.reduce((sum, bucket) => sum + bucket.orderValue, 0),
    series,
  }
}

// Filtered by reservationDate (the date the booking is *for*), not
// createdAt (when the record was made) — "how many reservations do we
// have this month" is a question about the former.
export async function getReservationsSummary({ date, month, year }) {
  const { start, end } = resolveDateRange({ date, month, year })

  const reservations = await prisma.reservation.findMany({
    where: { reservationDate: { gte: start, lt: end } },
    select: { status: true },
  })

  const byStatus = Object.fromEntries(RESERVATION_STATUSES.map((status) => [status, 0]))
  for (const reservation of reservations) byStatus[reservation.status] += 1

  return { total: reservations.length, byStatus }
}

// Filtered by Bill.billDate, PAID only — same "revenue = money actually
// collected" definition as getDashboardStats.
export async function getRevenueSummary({ date, month, year }) {
  const { start, end, granularity } = resolveDateRange({ date, month, year })

  const bills = await prisma.bill.findMany({
    where: { paymentStatus: 'PAID', billDate: { gte: start, lt: end } },
    select: { billDate: true, grandTotal: true },
  })

  const series = buildTimeSeries(bills, granularity, { dateField: 'billDate', amountField: 'grandTotal' }).map(
    (bucket) => ({ label: bucket.label, revenue: bucket.amount }),
  )

  return {
    granularity,
    totalRevenue: series.reduce((sum, bucket) => sum + bucket.revenue, 0),
    series,
  }
}
