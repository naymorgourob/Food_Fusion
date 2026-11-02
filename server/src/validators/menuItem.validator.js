export const MILK_LEVELS = ['NONE', 'LITTLE', 'MORE', 'FOAM']

export function validateMenuItem({
  name,
  categoryId,
  price,
  prepTimeMinutes,
  coffeeStrength,
  milkLevel,
}) {
  const errors = []

  if (!name || !name.trim()) errors.push('Food name is required.')

  if (!categoryId || !categoryId.trim()) errors.push('Category is required.')

  if (price === undefined || price === null || price === '') {
    errors.push('Price is required.')
  } else if (Number.isNaN(Number(price)) || Number(price) <= 0) {
    errors.push('Price must be a positive number.')
  }

  if (prepTimeMinutes !== undefined && prepTimeMinutes !== null && prepTimeMinutes !== '') {
    const minutes = Number(prepTimeMinutes)
    if (!Number.isInteger(minutes) || minutes <= 0) {
      errors.push('Preparation time must be a positive whole number of minutes.')
    }
  }

  if (coffeeStrength !== undefined && coffeeStrength !== null && coffeeStrength !== '') {
    const strength = Number(coffeeStrength)
    if (!Number.isInteger(strength) || strength < 1 || strength > 3) {
      errors.push('Coffee strength must be 1 (mild), 2 (medium) or 3 (strong).')
    }
  }

  if (milkLevel && !MILK_LEVELS.includes(milkLevel)) {
    errors.push(`Milk level must be one of: ${MILK_LEVELS.join(', ')}.`)
  }

  return errors
}
