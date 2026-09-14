import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

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

export async function listTables() {
  return prisma.table.findMany({ orderBy: { number: 'asc' } })
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
