/**
 * Picks the dish presented as "Today's Special".
 *
 * Lives outside the component file so fast refresh stays enabled there
 * (react-refresh only tolerates component exports).
 *
 * There is no "featured" flag on the Food model, so the choice is derived:
 * one dish per calendar day, stable for the whole day and identical for
 * every customer — so "Today's Special" means the same thing on two
 * different screens rather than being random per render.
 */
// A "special" should read as a plated dish, so drinks are skipped unless
// there is genuinely nothing else available to feature.
const NOT_A_MAIN_EVENT = /^(beverage|drink)/i

export function pickSpecial(dishes) {
  const availableAll = dishes.filter((dish) => dish.isAvailable)
  const plated = availableAll.filter((dish) => !NOT_A_MAIN_EVENT.test(dish.category?.name ?? ''))
  // Sorted by id so the candidate order doesn't depend on the customer's
  // current "Sort by" choice — otherwise switching to price-ascending
  // would silently change what "Today's Special" is.
  const available = (plated.length > 0 ? plated : availableAll)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
  if (available.length === 0) return null

  const today = new Date()
  const dayIndex = Math.floor(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000,
  )
  return available[dayIndex % available.length]
}
