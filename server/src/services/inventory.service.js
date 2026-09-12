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
  const items = await prisma.inventoryItem.findMany({ orderBy: { itemName: 'asc' } })
  return items.map(withStatus)
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
