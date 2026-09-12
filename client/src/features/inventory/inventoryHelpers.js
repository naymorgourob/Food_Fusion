/**
 * Inventory helpers, constants, sorting and filtering utilities (UI-08.3).
 */

export const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
]

export const SORT_OPTIONS = [
  { value: 'urgent', label: 'Urgent (Shortages first)' },
  { value: 'name-asc', label: 'Item Name (A to Z)' },
  { value: 'name-desc', label: 'Item Name (Z to A)' },
  { value: 'quantity-asc', label: 'Quantity (Lowest first)' },
  { value: 'quantity-desc', label: 'Quantity (Highest first)' },
  { value: 'category-asc', label: 'Category (A to Z)' },
]

export const UNIT_OPTIONS = ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK']

export const UNIT_LABELS = {
  KG: 'kg',
  GRAM: 'g',
  LITER: 'L',
  ML: 'ml',
  PIECE: 'pcs',
  BOX: 'box',
  PACK: 'pk',
}

export const UNIT_FULL_NAMES = {
  KG: 'Kilograms (kg)',
  GRAM: 'Grams (g)',
  LITER: 'Liters (L)',
  ML: 'Milliliters (ml)',
  PIECE: 'Pieces (pcs)',
  BOX: 'Boxes (box)',
  PACK: 'Packs (pk)',
}

export const COMMON_CATEGORIES = [
  'Produce',
  'Meat',
  'Seafood',
  'Dairy',
  'Grains',
  'Bakery',
  'Beverages',
  'Pantry',
  'Spices & Seasoning',
]

export const INVENTORY_STATUS_CONFIG = {
  IN_STOCK: {
    label: 'In Stock',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    progress: 'bg-emerald-500',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300',
    dot: 'bg-amber-500',
    progress: 'bg-amber-500',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    badge: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300',
    dot: 'bg-red-500',
    progress: 'bg-red-500',
  },
}

export function computeStockStatus(quantity, minStockLevel) {
  const qty = Number(quantity)
  if (qty <= 0) return 'OUT_OF_STOCK'
  if (qty < Number(minStockLevel)) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export function filterInventory(items, { search, status, category }) {
  const query = search.trim().toLowerCase()
  return items.filter((item) => {
    if (query) {
      const matchName = item.itemName?.toLowerCase().includes(query)
      const matchCategory = item.category?.toLowerCase().includes(query)
      if (!matchName && !matchCategory) return false
    }

    if (status && item.status !== status) return false

    if (category && item.category?.toLowerCase() !== category.toLowerCase()) {
      return false
    }

    return true
  })
}

export function sortInventory(items, sortBy) {
  const list = [...items]

  if (sortBy === 'urgent') {
    const priority = { OUT_OF_STOCK: 0, LOW_STOCK: 1, IN_STOCK: 2 }
    return list.sort((a, b) => {
      const pDiff = (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
      if (pDiff !== 0) return pDiff
      // If same status, lowest quantity ratio first
      const aRatio = Number(a.quantity) / (Number(a.minStockLevel) || 1)
      const bRatio = Number(b.quantity) / (Number(b.minStockLevel) || 1)
      return aRatio - bRatio
    })
  }

  if (sortBy === 'name-asc') {
    return list.sort((a, b) => a.itemName.localeCompare(b.itemName))
  }
  if (sortBy === 'name-desc') {
    return list.sort((a, b) => b.itemName.localeCompare(a.itemName))
  }
  if (sortBy === 'quantity-asc') {
    return list.sort((a, b) => Number(a.quantity) - Number(b.quantity))
  }
  if (sortBy === 'quantity-desc') {
    return list.sort((a, b) => Number(b.quantity) - Number(a.quantity))
  }
  if (sortBy === 'category-asc') {
    return list.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
  }

  return list
}

