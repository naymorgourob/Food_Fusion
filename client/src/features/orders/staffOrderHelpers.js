import { UtensilsCrossed, Bike, ShoppingBag } from 'lucide-react'

/**
 * Shared helpers for the Kitchen Queue and staff Orders page (UI-07).
 * Kept out of any component file so fast refresh stays enabled where
 * they're used.
 */

export const ORDER_TYPE_ICONS = {
  DINE_IN: UtensilsCrossed,
  TAKEAWAY: ShoppingBag,
  DELIVERY: Bike,
}

// What "active" means for the kitchen: still needs work from the
// restaurant. SERVED/ON_THE_WAY/COMPLETED/CANCELLED are done, from the
// kitchen's point of view — served has left the pass, on-the-way has left
// the building.
export const KITCHEN_ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY'])

/**
 * Minutes since the order was placed. Used both to sort the queue (oldest
 * first — the order that's been waiting longest gets seen first) and to
 * flag anything that's been sitting for a while.
 */
export function minutesWaiting(order) {
  return Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
}

// GET /orders selects only { id, name, imageUrl } on each line's menuItem
// (see MENU_ITEM_SELECT in order.service.js) — prepTimeMinutes is not in
// this payload, so priority can't be measured against a per-dish estimate
// without a backend change. It's derived from wait time alone instead,
// which is a real, checkable fact available on every order.
const HIGH_PRIORITY_PENDING_MINUTES = 5
const HIGH_PRIORITY_PREPARING_MINUTES = 25
const MEDIUM_PRIORITY_MINUTES = 15

/**
 * Priority is derived, not stored — Order has no priority column, and the
 * dish-level prep-time estimate isn't in this payload (see above). "High"
 * means the kitchen is genuinely running behind on THIS order: it's sat
 * PENDING for 5+ minutes with nobody acting on it, or it's been PREPARING
 * for 25+ minutes.
 */
export function priorityFor(order) {
  const waited = minutesWaiting(order)
  if (order.status === 'PENDING' && waited >= HIGH_PRIORITY_PENDING_MINUTES) return 'high'
  if (order.status === 'PREPARING' && waited >= HIGH_PRIORITY_PREPARING_MINUTES) return 'high'
  if (waited >= MEDIUM_PRIORITY_MINUTES) return 'medium'
  return 'normal'
}

/**
 * Minutes between now and `iso`, signed (negative once past). Kept as a
 * plain helper rather than inlined in KitchenOrderCard's render — calling
 * Date.now() directly in a component body is flagged as an impure render
 * by the react-hooks/purity rule; wrapping it here is exactly the pattern
 * minutesWaiting above already uses.
 */
export function minutesFromNow(iso) {
  if (!iso) return null
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000)
}

/** Next actionable status in the kitchen flow, or null if there isn't one. */
export function nextKitchenAction(status) {
  if (status === 'PENDING') return { status: 'ACCEPTED', label: 'Accept Order' }
  if (status === 'ACCEPTED') return { status: 'PREPARING', label: 'Start Cooking' }
  if (status === 'PREPARING') return { status: 'READY', label: 'Mark Ready' }
  // READY is handed to the service floor. Only the Waiter workspace may
  // move it onward, so Chef must not render a misleading action here.
  if (status === 'READY') return null
  return null
}
