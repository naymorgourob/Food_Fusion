/**
 * Picks the dish presented as "Today's Special".
 *
 * Lives outside the component file so fast refresh stays enabled there
 * (react-refresh only tolerates component exports).
 *
 * The caller passes the chef's picks; plated dishes among them are
 * preferred, then any of them. Either way it's one dish per calendar day,
 * stable for the whole day and identical for every customer — so "Today's
 * Special" means the same thing on two different screens rather than being
 * random per render.
 */
// A "special" should read as a plated dish, so drinks are skipped unless
// there is genuinely nothing else available to feature.
const NOT_A_MAIN_EVENT = /(beverage|drink|coffee|shake|smoothie)/i

export function pickSpecial(dishes) {
  const availableAll = dishes.filter((dish) => dish.isAvailable)
  const plated = availableAll.filter((dish) => !NOT_A_MAIN_EVENT.test(dish.category?.name ?? ''))
  const chefPicks = plated.filter((dish) => dish.isChefPick)
  // Sorted by id so the candidate order doesn't depend on the customer's
  // current "Sort by" choice — otherwise switching to price-ascending
  // would silently change what "Today's Special" is.
  const pool = chefPicks.length > 0 ? chefPicks : plated.length > 0 ? plated : availableAll
  const available = pool.slice().sort((a, b) => a.id.localeCompare(b.id))
  if (available.length === 0) return null

  const today = new Date()
  const dayIndex = Math.floor(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000,
  )
  return available[dayIndex % available.length]
}
