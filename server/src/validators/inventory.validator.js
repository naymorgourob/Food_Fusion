const VALID_UNITS = ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK']

// "Positive" is read as "non-negative" — 0 is a legitimate real-world
// state (an item that just ran out), not an invalid input. Only actual
// negative numbers and non-numbers are rejected.
export function validateInventoryItem({ itemName, category, unit, quantity, minStockLevel }) {
  const errors = []

  if (!itemName || !itemName.trim()) errors.push('Item name is required.')

  if (!category || !category.trim()) errors.push('Category is required.')

  if (!unit || !VALID_UNITS.includes(unit)) {
    errors.push('Unit must be one of Kg, Gram, Liter, Ml, Piece, Box, or Pack.')
  }

  if (quantity === undefined || quantity === null || quantity === '') {
    errors.push('Quantity is required.')
  } else if (Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
    errors.push('Quantity must be zero or a positive number.')
  }

  if (minStockLevel === undefined || minStockLevel === null || minStockLevel === '') {
    errors.push('Minimum stock level is required.')
  } else if (Number.isNaN(Number(minStockLevel)) || Number(minStockLevel) < 0) {
    errors.push('Minimum stock level must be zero or a positive number.')
  }

  return errors
}
