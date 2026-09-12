import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const TABLE_SELECT = { id: true, number: true, capacity: true }

async function getReservationOrThrow(id) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { table: { select: TABLE_SELECT } },
  })
  if (!reservation) throw new ApiError(404, 'Reservation not found.')
  return reservation
}

// Admin and Staff (Waiters) see all floor reservations; Customer sees own
export async function listReservations(user) {
  const where = user.role === 'ADMIN' || user.role === 'STAFF' ? {} : { customerId: user.id }
  return prisma.reservation.findMany({
    where,
    include: { table: { select: TABLE_SELECT } },
    orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
  })
}

export async function createReservation(customerId, input) {
  const {
    customerName,
    customerPhone,
    tableId,
    guestCount,
    reservationDate,
    reservationTime,
    specialRequest,
    occasion,
    occasionNote,
  } = input

  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new ApiError(400, 'Selected table does not exist.')
  if (table.status === 'INACTIVE') throw new ApiError(400, 'Selected table is not available for booking.')
  if (Number(guestCount) > table.capacity) {
    throw new ApiError(400, `Table ${table.number} only seats ${table.capacity} guests.`)
  }

  return prisma.reservation.create({
    data: {
      customerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      tableId,
      guestCount: Number(guestCount),
      reservationDate: new Date(reservationDate),
      reservationTime,
      specialRequest: specialRequest?.trim() || null,
      occasion: occasion || null,
      // Only meaningful alongside OTHER — stored as null for the named
      // occasions so a stale note can't linger after switching away.
      occasionNote: occasion === 'OTHER' ? occasionNote?.trim() || null : null,
    },
    include: { table: { select: TABLE_SELECT } },
  })
}

export async function updateReservationStatus(id, status) {
  await getReservationOrThrow(id)
  return prisma.reservation.update({
    where: { id },
    data: { status },
    include: { table: { select: TABLE_SELECT } },
  })
}

// "Cancel" is a status transition, not a row deletion — Cancelled is one of
// the four statuses in the reservation's own field list, and nothing
// meaningful gets hard-deleted in this system (same principle as Category/
// Food in Part 9). The DELETE HTTP verb maps to this, not a SQL DELETE.
// Cancellation window: a booking that has already been honoured or
// cancelled is history, so only PENDING/CONFIRMED can be withdrawn.
const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

/**
 * Cancel a reservation.
 *
 * Admin can cancel any booking. A Customer may cancel only their own, and
 * probing someone else's id returns 404 rather than 403 — a 403 would
 * confirm that the id exists, which leaks the existence of another
 * customer's reservation. Same rule as cancelOrder in order.service.js.
 */
export async function cancelReservation(user, id) {
  const reservation = await getReservationOrThrow(id)

  if (user.role === 'CUSTOMER' && reservation.customerId !== user.id) {
    throw new ApiError(404, 'Reservation not found.')
  }

  if (!CANCELLABLE_STATUSES.has(reservation.status)) {
    throw new ApiError(400, 'Only pending or confirmed reservations can be cancelled.')
  }

  return updateReservationStatus(id, 'CANCELLED')
}
