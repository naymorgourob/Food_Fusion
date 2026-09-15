import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { MAX_RESERVATION_DURATION_MINUTES, RESERVATION_DURATION_MINUTES } from './reservation.service.js'

// Same "check first for a friendly message, DB @unique as the safety net"
// pattern used for Category.name in Part 9.
async function assertNumberIsAvailable(number, excludeId = null) {
  const existing = await prisma.table.findFirst({
    where: { number: Number(number), ...(excludeId ? { id: { not: excludeId } } : {}) },
  })
  if (existing) throw new ApiError(409, `Table ${number} already exists.`)
}

async function getTableOrThrow(id) {
  const table = await prisma.table.findUnique({ where: { id } })
  if (!table) throw new ApiError(404, 'Table not found.')
  return table
}

export async function listTables({ reservationDate, reservationTime, durationMinutes = 120 } = {}) {
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } })
  const reservations = await prisma.reservation.findMany({
    where: { status: { in: ['PENDING', 'CONFIRMED'] } },
    select: { tableId: true, reservationDate: true, reservationTime: true, durationMinutes: true },
  })

  const requestedDate = reservationDate ? new Date(reservationDate) : null
  const hasValidDate = requestedDate && !Number.isNaN(requestedDate.getTime())
  const requestedParts = reservationTime ? String(reservationTime).split(':').map(Number) : []
  const hasValidTime = requestedParts.length === 2 && requestedParts.every(Number.isFinite)
  const requestedStart = hasValidTime ? requestedParts[0] * 60 + requestedParts[1] : null
  const requestedEnd = hasValidTime
    ? requestedStart + Math.min(MAX_RESERVATION_DURATION_MINUTES, Math.max(30, Number(durationMinutes) || RESERVATION_DURATION_MINUTES))
    : null

  function sameDate(left, right) {
    return left.toISOString().slice(0, 10) === right.toISOString().slice(0, 10)
  }

  function bookingWindow(reservation) {
    const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
    const start = hours * 60 + minutes
    const end = start + (reservation.durationMinutes || RESERVATION_DURATION_MINUTES)
    const endHours = Math.floor((end % (24 * 60)) / 60)
    const endMinutes = end % 60
    return {
      date: reservation.reservationDate,
      startTime: reservation.reservationTime,
      endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
      durationMinutes: reservation.durationMinutes || RESERVATION_DURATION_MINUTES,
    }
  }

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return tables.map((table) => {
    const tableReservations = reservations.filter((reservation) => reservation.tableId === table.id)
    const matchingReservations = hasValidDate && hasValidTime
      ? tableReservations.filter((reservation) => {
          if (!sameDate(reservation.reservationDate, requestedDate)) return false
          const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
          const start = hours * 60 + minutes
          const end = start + (reservation.durationMinutes || RESERVATION_DURATION_MINUTES)
          return start < requestedEnd && requestedStart < end
        })
      : []
    const upcomingReservation = tableReservations
      .filter((reservation) => {
        if (hasValidDate) {
          if (!sameDate(reservation.reservationDate, requestedDate)) return false
          const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
          return hours * 60 + minutes >= requestedStart
        }
        const date = reservation.reservationDate.toISOString().slice(0, 10)
        const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
        return date > today || (date === today && hours * 60 + minutes >= currentMinutes)
      })
      .sort((left, right) => `${left.reservationDate.toISOString()}${left.reservationTime}`.localeCompare(`${right.reservationDate.toISOString()}${right.reservationTime}`))[0]
    const booking = matchingReservations[0] || upcomingReservation
    return {
      ...table,
      reservationAvailable: hasValidDate && hasValidTime ? matchingReservations.length === 0 : undefined,
      bookingWindow: booking ? bookingWindow(booking) : null,
    }
  })
}

export async function createTable({ number, capacity, status, description, windowSidePosition, reservationCost }) {
  await assertNumberIsAvailable(number)
  return prisma.table.create({
    data: {
      number: Number(number),
      capacity: Number(capacity),
      status: status || 'AVAILABLE',
      description: description?.trim() || null,
      windowSidePosition: windowSidePosition?.trim() || 'Interior',
      reservationCost: reservationCost ?? 0,
    },
  })
}

export async function updateTable(id, { number, capacity, status, description, windowSidePosition, reservationCost }) {
  const existing = await getTableOrThrow(id)
  await assertNumberIsAvailable(number, id)

  return prisma.table.update({
    where: { id },
    data: {
      number: Number(number),
      capacity: Number(capacity),
      status,
      description: description?.trim() || null,
      windowSidePosition: windowSidePosition?.trim() || existing.windowSidePosition,
      reservationCost: reservationCost ?? existing.reservationCost,
    },
  })
}

export async function deleteTable(id) {
  await getTableOrThrow(id)
  // No assignment guard needed, unlike Category — nothing references a
  // Table yet. Reservation (Part 11) is where a similar guard will belong.
  await prisma.table.delete({ where: { id } })
}
