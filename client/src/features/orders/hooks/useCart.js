import { useCallback, useMemo, useState } from 'react'

/**
 * Cart state for the redesigned menu experience (UI-03).
 *
 * This replaces the wizard's flat `quantities` map with something the menu
 * grid, the detail modal, and the cart drawer can all share. It is
 * deliberately a *shape-compatible superset*: `quantities` is still exposed
 * as `{ [menuItemId]: number }` so SmartOrderWizard's existing selection,
 * pricing, and submit logic keep working untouched.
 *
 * Lines also carry the dish itself plus per-item notes, which the old map
 * couldn't express — the drawer needs the name/price/image to render a line
 * before the menu list has necessarily loaded that page of results.
 *
 * No persistence: an order is placed in one sitting, and a stale cart
 * restored days later could reference dishes that are no longer available.
 */
export function useCart(initialQuantities = {}) {
  // `lines` is keyed by menu item id -> { item, quantity, notes }
  const [lines, setLines] = useState(() => {
    const seeded = {}
    for (const [id, quantity] of Object.entries(initialQuantities)) {
      if (quantity > 0) seeded[id] = { item: null, quantity, notes: '' }
    }
    return seeded
  })

  // Bumped on every add so the UI can fire a one-shot "added" animation.
  const [lastAdded, setLastAdded] = useState(null)

  /**
   * Attach full dish objects to lines seeded from ids alone (Order Again /
   * Order All Favorites arrive as ids before the menu has loaded). Only
   * fills gaps — never overwrites a quantity the customer has since edited.
   */
  const hydrate = useCallback((menuItems) => {
    if (!menuItems?.length) return
    setLines((current) => {
      let changed = false
      const next = { ...current }
      for (const item of menuItems) {
        if (next[item.id] && !next[item.id].item) {
          next[item.id] = { ...next[item.id], item }
          changed = true
        }
      }
      return changed ? next : current
    })
  }, [])

  const add = useCallback((item, quantity = 1, notes = '') => {
    setLines((current) => {
      const existing = current[item.id]
      return {
        ...current,
        [item.id]: {
          item,
          quantity: (existing?.quantity ?? 0) + quantity,
          // A fresh note replaces the old one; an empty note keeps it.
          notes: notes || existing?.notes || '',
        },
      }
    })
    setLastAdded({ id: item.id, name: item.name, at: Date.now() })
  }, [])

  /** Absolute set — used by the drawer's +/- steppers. 0 removes the line. */
  const setQuantity = useCallback((menuItemId, quantity, item = null) => {
    const next = Math.max(0, Math.floor(Number(quantity) || 0))
    setLines((current) => {
      if (next === 0) {
        const rest = { ...current }
        delete rest[menuItemId]
        return rest
      }
      const existing = current[menuItemId]
      return {
        ...current,
        [menuItemId]: {
          item: item ?? existing?.item ?? null,
          quantity: next,
          notes: existing?.notes ?? '',
        },
      }
    })
  }, [])

  const setNotes = useCallback((menuItemId, notes) => {
    setLines((current) =>
      current[menuItemId] ? { ...current, [menuItemId]: { ...current[menuItemId], notes } } : current,
    )
  }, [])

  const remove = useCallback((menuItemId) => setQuantity(menuItemId, 0), [setQuantity])
  const clear = useCallback(() => setLines({}), [])

  // Only lines whose dish is known can be priced or listed; an unhydrated
  // seeded line still counts toward quantities so the wizard can submit it.
  const items = useMemo(
    () => Object.values(lines).filter((line) => line.item && line.quantity > 0),
    [lines],
  )

  const quantities = useMemo(
    () => Object.fromEntries(Object.entries(lines).map(([id, line]) => [id, line.quantity])),
    [lines],
  )

  const count = useMemo(
    () => Object.values(lines).reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, { item, quantity }) => sum + Number(item.price) * quantity, 0),
    [items],
  )

  const quantityOf = useCallback((menuItemId) => lines[menuItemId]?.quantity ?? 0, [lines])

  return {
    lines,
    items,
    quantities,
    count,
    subtotal,
    lastAdded,
    quantityOf,
    add,
    setQuantity,
    setNotes,
    remove,
    clear,
    hydrate,
  }
}
