const NEW_FOR_DAYS = 14

// Categories served as drinks get the "coffee shop" card and panel design.
const DRINK_CATEGORY = /(coffee|beverage|drink|shake|smoothie|tea|juice|mocktail)/i

export function isDrinkCategory(name) {
  return DRINK_CATEGORY.test(name ?? '')
}

export function isDrink(dish) {
  return isDrinkCategory(dish?.category?.name)
}

// Bangla cuisine is served on terracotta plates.
export function isBangladeshi(dish) {
  return /bangla/i.test(dish?.category?.name ?? '')
}

// "New" is derived honestly from createdAt rather than stored.
export function isNew(createdAt) {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age >= 0 && age < NEW_FOR_DAYS * 24 * 60 * 60 * 1000
}

export const STRENGTH_LABELS = { 1: 'Mild', 2: 'Medium', 3: 'Strong' }

export const MILK_LABELS = {
  NONE: 'No milk',
  LITTLE: 'Little milk',
  MORE: 'More milk',
  FOAM: 'More foam',
}
