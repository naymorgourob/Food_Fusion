import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { ApiError } from '../utils/ApiError.js'

const TABLE_SELECT = { id: true, number: true, capacity: true, windowSidePosition: true, reservationCost: true }
export const RESERVATION_DURATION_MINUTES = 120
export const MAX_RESERVATION_DURATION_MINUTES = 240

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
  const isStaffView = user.role === 'ADMIN' || user.role === 'STAFF'
  const where = isStaffView ? {} : { customerId: user.id }
  return prisma.reservation.findMany({
    where,
    include: { table: { select: TABLE_SELECT } },
    orderBy: isStaffView
      ? [{ createdAt: 'desc' }]
      : [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
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
    durationMinutes = RESERVATION_DURATION_MINUTES,
    specialRequest,
    occasion,
    occasionNote,
    paymentReference,
    paymentProofImage,
  } = input

  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new ApiError(400, 'Selected table does not exist.')
  if (table.status === 'INACTIVE') throw new ApiError(400, 'Selected table is not available for booking.')
  if (Number(guestCount) > table.capacity) {
    throw new ApiError(400, `Table ${table.number} only seats ${table.capacity} guests.`)
  }
  const duration = Math.min(
    MAX_RESERVATION_DURATION_MINUTES,
    Math.max(30, Number(durationMinutes) || RESERVATION_DURATION_MINUTES),
  )

  const reservationDateValue = new Date(reservationDate)
  if (Number.isNaN(reservationDateValue.getTime())) {
    throw new ApiError(400, 'Reservation date is invalid.')
  }

  const amount = new Prisma.Decimal(table.reservationCost)
    .mul(new Prisma.Decimal(duration))
    .div(new Prisma.Decimal(RESERVATION_DURATION_MINUTES))
    .toDecimalPlaces(2)
  const advanceAmount = amount.mul(new Prisma.Decimal('0.20')).toDecimalPlaces(2)

  return prisma.$transaction(
    async (tx) => {
      const existingReservations = await tx.reservation.findMany({
        where: {
          tableId,
          reservationDate: reservationDateValue,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { reservationTime: true, durationMinutes: true },
      })
      const [requestedHours, requestedMinutes] = reservationTime.split(':').map(Number)
      const requestedStart = requestedHours * 60 + requestedMinutes
      const requestedEnd = requestedStart + duration
      const hasConflict = existingReservations.some((existing) => {
        const [hours, minutes] = existing.reservationTime.split(':').map(Number)
        const start = hours * 60 + minutes
        const end = start + (existing.durationMinutes || RESERVATION_DURATION_MINUTES)
        return start < requestedEnd && requestedStart < end
      })
      if (hasConflict) {
        throw new ApiError(409, 'That table is already reserved for the selected date and time.')
      }

      return tx.reservation.create({
        data: {
          customerId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          tableId,
          guestCount: Number(guestCount),
          reservationDate: reservationDateValue,
          reservationTime,
          durationMinutes: duration,
          specialRequest: specialRequest?.trim() || null,
          occasion: occasion || null,
          // Only meaningful alongside OTHER — stored as null for the named
          // occasions so a stale note can't linger after switching away.
          occasionNote: occasion === 'OTHER' ? occasionNote?.trim() || null : null,
          totalAmount: amount,
          advanceAmount,
          paymentReference: paymentReference?.trim() || null,
          paymentProofImage: paymentProofImage || null,
          paymentSubmittedAt: new Date(),
        },
        include: { table: { select: TABLE_SELECT } },
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  )
}

export async function updateReservationStatus(id, status) {
  const reservation = await getReservationOrThrow(id)
  if (
    status === 'CONFIRMED' &&
    !reservation.paymentReference &&
    !reservation.paymentProofImage
  ) {
    throw new ApiError(400, 'Payment proof must be submitted before confirming this reservation.')
  }
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
