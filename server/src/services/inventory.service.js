import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Comparison only (never arithmetic), so converting Decimal -> Number here
// doesn't risk the rounding problems that rule out Number for money math
// elsewhere in this app — magnitude comparison is exact for values in this
// range either way.
function computeStatus(quantity, minStockLevel) {
  const qty = Number(quantity)
  if (qty <= 0) return 'OUT_OF_STOCK'
  if (qty < Number(minStockLevel)) return 'LOW_STOCK'
  return 'IN_STOCK'
}

function withStatus(item) {
  return { ...item, status: computeStatus(item.quantity, item.minStockLevel) }
}

async function getInventoryItemOrThrow(id) {
  const item = await prisma.inventoryItem.findUnique({ where: { id } })
  if (!item) throw new ApiError(404, 'Inventory item not found.')
  return item
}

export async function listInventoryItems() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { itemName: 'asc' },
    include: {
      usages: { orderBy: { usageDate: 'desc' }, include: { recordedBy: { select: { id: true, fullName: true, position: true } } } },
    },
  })
  return items.map(withStatus)
}

export async function recordInventoryUsage(id, userId, { quantityUsed, usageDate, note }) {
  const used = Number(quantityUsed)
  if (!Number.isFinite(used) || used <= 0) throw new ApiError(400, 'Quantity used must be greater than zero.')
  const date = usageDate ? new Date(usageDate) : new Date()
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Usage date is invalid.')

  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({ where: { id } })
    if (!item) throw new ApiError(404, 'Inventory item not found.')
    const remaining = Number(item.quantity) - used
    if (remaining < 0) throw new ApiError(400, `Only ${item.quantity} ${item.unit} remains.`)

    await tx.inventoryItem.update({ where: { id }, data: { quantity: remaining } })
    return tx.inventoryUsage.create({
      data: {
        inventoryItemId: id,
        recordedById: userId,
        quantityUsed: used,
        remainingQuantity: remaining,
        usageDate: date,
        note: note?.trim() || null,
      },
      include: { recordedBy: { select: { id: true, fullName: true, position: true } }, inventoryItem: true },
    })
  })
}

export async function createInventoryItem({ itemName, category, unit, quantity, minStockLevel }) {
  const item = await prisma.inventoryItem.create({
    data: {
      itemName: itemName.trim(),
      category: category.trim(),
      unit,
      quantity,
      minStockLevel,
    },
  })
  return withStatus(item)
}

export async function updateInventoryItem(id, { itemName, category, unit, quantity, minStockLevel }) {
  await getInventoryItemOrThrow(id)

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      itemName: itemName.trim(),
      category: category.trim(),
      unit,
      quantity,
      minStockLevel,
    },
  })
  return withStatus(item)
}

export async function updateInventoryStock(id, { quantity }) {
  await getInventoryItemOrThrow(id)

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      quantity,
    },
  })
  return withStatus(item)
}

// A real hard delete — unlike Category/Food/Customer, nothing else in the
// schema references InventoryItem (no recipe/BOM link exists in this
// part's scope), so there's no history to protect and no onDelete guard
// needed.
export async function deleteInventoryItem(id) {
  await getInventoryItemOrThrow(id)
  await prisma.inventoryItem.delete({ where: { id } })
}
