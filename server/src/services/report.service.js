import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { resolveDateRange, buildTimeSeries } from '../utils/reportFilters.js'

const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

export async function getDashboardStats() {
  const [
    totalCustomers,
    totalStaff,
    totalMenuItems,
    totalOrders,
    totalReservations,
    totalInventoryItems,
    paidBills,
    activeOrdersCount,
    completedOrdersCount,
    activeReservationsCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'STAFF' } }),
    prisma.food.count(),
    prisma.order.count(),
    prisma.reservation.count(),
    prisma.inventoryItem.count(),
    prisma.bill.findMany({ where: { paymentStatus: 'PAID' }, select: { grandTotal: true } }),
    prisma.order.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'] },
      },
    }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
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
    activeOrdersCount,
    completedOrdersCount,
    activeReservationsCount,
  }
}

// Serves both "Daily Orders" (pass month) and "Monthly Orders" (omit it) —
// see reportFilters.js for how the granularity is picked.
export async function getOrdersSummary({ date, month, year }) {
  const { start, end, granularity } = resolveDateRange({ date, month, year })

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    select: { createdAt: true, totalAmount: true, status: true, orderType: true },
  })

  const series = buildTimeSeries(orders, granularity, { dateField: 'createdAt', amountField: 'totalAmount' }).map(
    (bucket) => ({ label: bucket.label, orderCount: bucket.count, orderValue: bucket.amount }),
  )

  const byStatus = {
    PENDING: 0,
    ACCEPTED: 0,
    PREPARING: 0,
    READY: 0,
    ON_THE_WAY: 0,
    SERVED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  }

  const byOrderType = {
    DINE_IN: 0,
    DELIVERY: 0,
    TAKEAWAY: 0,
  }

  for (const order of orders) {
    if (byStatus[order.status] !== undefined) byStatus[order.status] += 1
    if (byOrderType[order.orderType] !== undefined) byOrderType[order.orderType] += 1
  }

  const totalOrderValue = series.reduce((sum, bucket) => sum + bucket.orderValue, 0)
  const averageOrderValue = orders.length > 0 ? totalOrderValue / orders.length : 0

  return {
    granularity,
    totalOrders: orders.length,
    totalOrderValue,
    averageOrderValue,
    byStatus,
    byOrderType,
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
    select: { status: true, guestCount: true },
  })

  const byStatus = Object.fromEntries(RESERVATION_STATUSES.map((status) => [status, 0]))
  let totalGuests = 0

  for (const reservation of reservations) {
    if (byStatus[reservation.status] !== undefined) byStatus[reservation.status] += 1
    totalGuests += reservation.guestCount || 0
  }

  return {
    total: reservations.length,
    totalGuests,
    byStatus,
  }
}

// Filtered by Bill.billDate, PAID only — same "revenue = money actually
// collected" definition as getDashboardStats.
export async function getRevenueSummary({ date, month, year }) {
  const { start, end, granularity } = resolveDateRange({ date, month, year })

  const bills = await prisma.bill.findMany({
    where: { paymentStatus: 'PAID', billDate: { gte: start, lt: end } },
    select: { billDate: true, grandTotal: true, subtotal: true, vatAmount: true, discount: true },
  })

  const series = buildTimeSeries(bills, granularity, { dateField: 'billDate', amountField: 'grandTotal' }).map(
    (bucket) => ({ label: bucket.label, revenue: bucket.amount }),
  )

  const totalRevenue = series.reduce((sum, bucket) => sum + bucket.revenue, 0)
  const totalBills = bills.length
  const averageBillValue = totalBills > 0 ? totalRevenue / totalBills : 0
  const totalVat = bills.reduce((sum, b) => sum + Number(b.vatAmount || 0), 0)
  const totalDiscount = bills.reduce((sum, b) => sum + Number(b.discount || 0), 0)

  return {
    granularity,
    totalRevenue,
    totalBills,
    averageBillValue,
    totalVat,
    totalDiscount,
    series,
  }
}
