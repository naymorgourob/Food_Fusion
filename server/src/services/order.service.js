import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { ApiError } from '../utils/ApiError.js'
import { getSettings } from './settings.service.js'
import { getLoyaltySummary, recordTransaction, awardPointsForCompletedOrder } from './loyalty.service.js'

const CUSTOMER_SELECT = { id: true, fullName: true, email: true, role: true }
const TABLE_SELECT = { id: true, number: true, capacity: true }
const MENU_ITEM_SELECT = { id: true, name: true, imageUrl: true }
const STAFF_SELECT = { id: true, fullName: true, position: true, phone: true }

const BILL_SELECT = {
  id: true,
  billNumber: true,
  billDate: true,
  grandTotal: true,
  paymentStatus: true,
}

const ORDER_INCLUDE = {
  customer: { select: CUSTOMER_SELECT },
  table: { select: TABLE_SELECT },
  items: { include: { menuItem: { select: MENU_ITEM_SELECT } } },
  assignedStaff: { select: STAFF_SELECT },
  // "Invoice" in Order Details (Part 18) — null until Admin/Staff
  // generates one via the Billing module (Part 13); this doesn't
  // duplicate Billing, just surfaces its result on the tracking page.
  bill: { select: BILL_SELECT },
}

// Flat fee, not a Settings field — Part 17's Settings model doesn't cover
// this, and adding it there would be scope creep beyond this part's own
// "possible fields" list. A real system would likely price this by
// distance; out of scope here.
const DELIVERY_CHARGE = new Prisma.Decimal(3.0)

// Each maps a status to the one Order column that records when the order
// first reached it — set exactly once (see updateOrderStatus), which is
// the entire "Order Timeline" feature: read these back out in
// chronological order and you have the timeline.
const TIMELINE_FIELD_BY_STATUS = {
  ACCEPTED: 'acceptedAt',
  PREPARING: 'preparingAt',
  READY: 'readyAt',
  ON_THE_WAY: 'onTheWayAt',
  SERVED: 'servedAt',
  COMPLETED: 'completedAt',
  CANCELLED: 'cancelledAt',
}

async function getOrderOrThrow(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE })
  if (!order) throw new ApiError(404, 'Order not found.')
  return order
}

// Admin/Staff manage every order; a Customer only ever sees their own —
// enforced here from req.user (set by authenticateUser from the JWT),
// never from a client-supplied filter. Same pattern as
// reservation.service.js's listReservations.
export async function listOrders(user) {
  const where = user.role === 'CUSTOMER' ? { customerId: user.id } : {}
  return prisma.order.findMany({
    where,
    include: ORDER_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

// A Customer requesting someone else's order id gets the same 404 as a
// nonexistent id, never a 403 — so probing random ids can never confirm
// whether an order exists at all.
export async function getOrderById(user, id) {
  const order = await getOrderOrThrow(id)
  if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
    throw new ApiError(404, 'Order not found.')
  }
  return order
}

// Staff/Admin need a list of Staff to assign an order to, but Part 14's
// Staff Management endpoints are Admin-only — this is the minimal,
// Staff-reachable subset (no email/phone/isActive) purely for the
// assignment dropdown.
export async function listAssignableStaff() {
  return prisma.user.findMany({
    where: { role: 'STAFF', isActive: true },
    select: STAFF_SELECT,
    orderBy: { fullName: 'asc' },
  })
}

export async function createOrder(customerId, input) {
  const {
    tableId,
    items,
    orderType,
    deliveryAddress,
    deliveryPhone,
    scheduledPickupTime,
    scheduledArrivalTime,
    guestCount,
    specialInstructions,
    pointsToRedeem,
    paymentReference,
    paymentProofImage,
  } = input

  // A table only means something for Dine-In — Delivery/Takeaway orders
  // never have one, regardless of what the client sends.
  const resolvedTableId = orderType === 'DINE_IN' ? tableId || null : null
  if (resolvedTableId) {
    const table = await prisma.table.findUnique({ where: { id: resolvedTableId } })
    if (!table) throw new ApiError(400, 'Selected table does not exist.')
  }

  const menuItemIds = [...new Set(items.map((item) => item.menuItemId))]
  const menuItems = await prisma.food.findMany({ where: { id: { in: menuItemIds } } })
  const menuItemById = new Map(menuItems.map((food) => [food.id, food]))

  // unitPrice/subtotal are snapshotted from Food.price right now, at order
  // time — never read live off Food again later, so a future price change
  // can't rewrite this order's total. Decimal's own .mul()/.add() are used
  // throughout (never a plain JS number) to keep money math exact.
  let totalAmount = new Prisma.Decimal(0)
  const orderItemsData = items.map(({ menuItemId, quantity }) => {
    const menuItem = menuItemById.get(menuItemId)
    if (!menuItem) throw new ApiError(400, 'One or more selected menu items no longer exist.')
    if (!menuItem.isAvailable) throw new ApiError(400, `${menuItem.name} is currently unavailable.`)

    const qty = Number(quantity)
    const subtotal = menuItem.price.mul(qty)
    totalAmount = totalAmount.add(subtotal)

    return { menuItemId, quantity: qty, unitPrice: menuItem.price, subtotal }
  })

  // --- Loyalty redemption (Part 18.1) ---
  // Validated against the customer's live ledger balance, never against a
  // number the client sends — "do NOT allow redeeming more than the
  // available balance" has to be enforced server-side to mean anything.
  const requestedPoints = Math.max(0, Math.floor(Number(pointsToRedeem) || 0))
  let pointsRedeemed = 0
  let loyaltyDiscount = new Prisma.Decimal(0)

  if (requestedPoints > 0) {
    const summary = await getLoyaltySummary(customerId)
    if (requestedPoints > summary.currentPoints) {
      throw new ApiError(400, `You only have ${summary.currentPoints} points available.`)
    }

    const settings = await getSettings()
    const rawDiscount = new Prisma.Decimal(requestedPoints).mul(settings.loyaltyPointValue)
    // A discount can never exceed the food total — otherwise the customer
    // would be burning points for nothing (or worse, a negative total).
    loyaltyDiscount = Prisma.Decimal.min(rawDiscount, totalAmount)
    // Only charge for the points actually used. If the discount was capped
    // by the order total, refund the surplus points by recording fewer.
    pointsRedeemed = loyaltyDiscount.equals(rawDiscount)
      ? requestedPoints
      : loyaltyDiscount.div(settings.loyaltyPointValue).ceil().toNumber()

    totalAmount = totalAmount.sub(loyaltyDiscount)
  }

  const advanceAmount = totalAmount.mul(new Prisma.Decimal('0.20')).toDecimalPlaces(2)

  // A transaction so the order and its REDEEMED ledger row are written
  // together — a crash between them would otherwise either charge points
  // for no order or give a discount without deducting points.
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
    data: {
      customerId,
      tableId: resolvedTableId,
      totalAmount,
      orderType,
      pointsRedeemed,
      loyaltyDiscount,
      advanceAmount,
      paymentReference: paymentReference?.trim() || null,
      paymentProofImage: paymentProofImage || null,
      paymentSubmittedAt: new Date(),
      items: { create: orderItemsData },
      specialInstructions: specialInstructions?.trim() || null,
      // Delivery-only
      ...(orderType === 'DELIVERY'
        ? {
            deliveryAddress: deliveryAddress.trim(),
            deliveryPhone: deliveryPhone.trim(),
            deliveryCharge: DELIVERY_CHARGE,
          }
        : {}),
      // Takeaway-only
      ...(orderType === 'TAKEAWAY' && scheduledPickupTime ? { scheduledPickupTime: new Date(scheduledPickupTime) } : {}),
      // Dine-in "Schedule Dine-In" only — "Dine-In Now" leaves both null
      ...(orderType === 'DINE_IN' && scheduledArrivalTime
        ? { scheduledArrivalTime: new Date(scheduledArrivalTime), guestCount: Number(guestCount) }
        : {}),
      },
      include: ORDER_INCLUDE,
    })

    if (pointsRedeemed > 0) {
      await recordTransaction(
        {
          customerId,
          type: 'REDEEMED',
          points: pointsRedeemed,
          reason: `Redeemed on order #${String(order.orderNumber).padStart(6, '0')}`,
          orderId: order.id,
        },
        tx,
      )
    }

    // When dine-in order is placed, mark table as OCCUPIED
    if (resolvedTableId) {
      await tx.table.update({
        where: { id: resolvedTableId },
        data: { status: 'OCCUPIED' },
      })
    }

    return order
  })
}

export async function updateOrderStatus(id, status) {
  const order = await getOrderOrThrow(id)

  if (
    status === 'ACCEPTED' &&
    order.customer.role === 'CUSTOMER' &&
    !order.paymentReference &&
    !order.paymentProofImage
  ) {
    throw new ApiError(400, 'Payment proof must be submitted before accepting this order.')
  }

  // The branch after READY depends on order type — a delivery order is
  // never "Ready to Serve" (there's no table to serve it to) and a
  // dine-in/takeaway order is never "On the Way" (nobody's driving it
  // anywhere).
  if (status === 'ON_THE_WAY' && order.orderType !== 'DELIVERY') {
    throw new ApiError(400, '"On the Way" only applies to delivery orders.')
  }
  if (status === 'SERVED' && order.orderType === 'DELIVERY') {
    throw new ApiError(400, '"Ready to Serve" only applies to dine-in or takeaway orders.')
  }

  const timelineField = TIMELINE_FIELD_BY_STATUS[status]
  const data = { status }
  // Only stamped the first time — a status the order revisits (shouldn't
  // normally happen, but the dropdown is still a free choice) doesn't
  // overwrite the original timeline entry.
  if (timelineField && !order[timelineField]) data[timelineField] = new Date()

  // Read before opening the transaction: every query inside a Prisma
  // interactive transaction must use its `tx` client, and getSettings()
  // uses the global one — doing it inside would deadlock against the
  // transaction's own writes. Only fetched when it'll actually be needed.
  const settings = status === 'COMPLETED' ? await getSettings() : null

  // Points are awarded on completion, not placement — "customers earn
  // points after every completed order." awardPointsForCompletedOrder is
  // itself idempotent (it checks for an existing EARNED row), so flipping
  // status away from and back to COMPLETED can't double-award; the
  // transaction keeps the status change and the ledger rows atomic.
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id }, data, include: ORDER_INCLUDE })
    if (status === 'COMPLETED') {
      await awardPointsForCompletedOrder(updated, settings, tx)
    }

    // When order completes or is cancelled, if no other active orders remain for table, mark AVAILABLE
    if (['COMPLETED', 'CANCELLED'].includes(status) && order.tableId) {
      const remainingActive = await tx.order.count({
        where: {
          tableId: order.tableId,
          id: { not: order.id },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      })
      if (remainingActive === 0) {
        const table = await tx.table.findUnique({ where: { id: order.tableId } })
        if (table && table.status === 'OCCUPIED') {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: 'AVAILABLE' },
          })
        }
      }
    }

    return updated
  })
}

// Chef/Waiter/Delivery Staff — role STAFF only, checked here since Prisma
// can't express "only rows where role = STAFF" as a foreign key
// constraint. staffId of null/empty clears the assignment.
export async function assignStaff(id, staffId) {
  await getOrderOrThrow(id)

  if (staffId) {
    const staff = await prisma.user.findFirst({ where: { id: staffId, role: 'STAFF' } })
    if (!staff) throw new ApiError(400, 'Selected staff member does not exist.')
  }

  return prisma.order.update({
    where: { id },
    data: { assignedStaffId: staffId || null },
    include: ORDER_INCLUDE,
  })
}

// Staff sets these directly (not customer-supplied) — "staff should be
// able to update the estimated time" and the customer just reads
// whatever staff last set, via the same GET the tracking page polls.
export async function updateEstimatedTimes(id, { estimatedReadyTime, estimatedDeliveryTime }) {
  await getOrderOrThrow(id)

  return prisma.order.update({
    where: { id },
    data: {
      ...(estimatedReadyTime !== undefined ? { estimatedReadyTime: estimatedReadyTime ? new Date(estimatedReadyTime) : null } : {}),
      ...(estimatedDeliveryTime !== undefined
        ? { estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null }
        : {}),
    },
    include: ORDER_INCLUDE,
  })
}

// Cancellation window: only while Placed (PENDING) or Accepted — once the
// kitchen has started Preparing, it's too late. Stricter than the old
// "not already Completed" rule this replaces. Callable by the owning
// Customer or by Admin/Staff (Part 18 adds a Cancel button to the
// customer's own tracking page) — same 404-not-403 privacy rule as
// getOrderById for a Customer targeting someone else's order.
export async function cancelOrder(user, id) {
  const order = await getOrderOrThrow(id)
  if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
    throw new ApiError(404, 'Order not found.')
  }
  if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
    throw new ApiError(400, 'Orders can only be cancelled while Placed or Accepted.')
  }
  return updateOrderStatus(id, 'CANCELLED')
}
