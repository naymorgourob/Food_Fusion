import { ReceiptText, ClipboardCheck, ChefHat, Utensils, Bike, PackageCheck, PartyPopper, XCircle } from 'lucide-react'

/**
 * Shared status vocabulary for the tracking experience (UI-05).
 *
 * Kept out of any component file so several components can import it
 * without disabling fast refresh, and so the flow order can't drift
 * between the hero, the timeline, and the notification history.
 */

// Matches the branch rule the backend enforces and OrderTimeline draws: a
// delivery order is never "Ready to Serve", and a dine-in/takeaway order
// is never "On the Way".
export const FLOW_BY_TYPE = {
  DINE_IN: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  TAKEAWAY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  DELIVERY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'COMPLETED'],
}

// ACCEPTED deliberately isn't a checkmark: the timeline reserves the tick
// for *completed* stages, so an in-progress "Accepted" showing a check
// read as "already done". ClipboardCheck says "confirmed" without
// colliding with that meaning.
export const STATUS_ICONS = {
  PENDING: ReceiptText,
  ACCEPTED: ClipboardCheck,
  PREPARING: ChefHat,
  READY: Utensils,
  ON_THE_WAY: Bike,
  SERVED: PackageCheck,
  COMPLETED: PartyPopper,
  CANCELLED: XCircle,
}

/**
 * The Order column that records when each stage happened. createdAt
 * already covers "Placed", so there is no separate placedAt column.
 */
export const TIMESTAMP_FIELD = {
  PENDING: 'createdAt',
  ACCEPTED: 'acceptedAt',
  PREPARING: 'preparingAt',
  READY: 'readyAt',
  ON_THE_WAY: 'onTheWayAt',
  SERVED: 'servedAt',
  COMPLETED: 'completedAt',
  CANCELLED: 'cancelledAt',
}

/**
 * Friendly, order-type-aware message for the current stage — the line
 * that answers "so what's happening right now?" without the customer
 * having to interpret a status enum.
 */
export function statusMessage(status, orderType) {
  const delivery = orderType === 'DELIVERY'
  const takeaway = orderType === 'TAKEAWAY'

  switch (status) {
    case 'PENDING':
      return 'We have your order — the restaurant will confirm it in a moment.'
    case 'ACCEPTED':
      return 'Your order is confirmed and queued for the kitchen.'
    case 'PREPARING':
      return 'Your chef has started preparing your meal.'
    case 'READY':
      if (delivery) return 'Your food is packed and waiting for a rider.'
      if (takeaway) return 'Your order is ready for pickup.'
      return 'Your food is plated and on its way to your table.'
    case 'ON_THE_WAY':
      return 'Your order is on the way to you.'
    case 'SERVED':
      if (takeaway) return 'Your order is at the counter — come and collect it.'
      return 'Your meal has been served. Enjoy!'
    case 'COMPLETED':
      return 'This order is complete. Thank you for dining with us.'
    case 'CANCELLED':
      return 'This order was cancelled.'
    default:
      return ''
  }
}

/** Progress through the flow as a 0–100 percentage. */
export function progressFor(status, orderType) {
  if (status === 'CANCELLED') return 0
  const flow = FLOW_BY_TYPE[orderType] ?? FLOW_BY_TYPE.DINE_IN
  const index = flow.indexOf(status)
  if (index < 0) return 0
  return Math.round(((index + 1) / flow.length) * 100)
}

/** Minutes until `iso`, or null when unset or already past. */
export function minutesUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  return Math.round(diff / 60000)
}

/**
 * The ETA that matters for this order type: delivery cares about arrival
 * at the customer, everything else about leaving the kitchen.
 */
export function etaFor(order) {
  return order.orderType === 'DELIVERY' ? order.estimatedDeliveryTime : order.estimatedReadyTime
}

export const IS_FINISHED = new Set(['COMPLETED', 'CANCELLED'])
