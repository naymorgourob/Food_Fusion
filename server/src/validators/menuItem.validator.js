export function validateMenuItem({ name, categoryId, price, prepTimeMinutes }) {
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

  return errors
}
