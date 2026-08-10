// Single source of truth for order status display labels — used by
// OrderStatusBadge, OrderProgressTracker, OrderTimeline, and
// OrderDetailsModal, so all four always agree on the wording. PENDING and
// SERVED differ from their raw enum names (Placed / Ready to Serve) —
// see the OrderStatus enum comment in server/prisma/schema.prisma for why
// the underlying database values aren't renamed to match.
export const ORDER_STATUS_LABELS = {
  PENDING: 'Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  ON_THE_WAY: 'On the Way',
  SERVED: 'Ready to Serve',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// order.totalAmount is deliberately food-only — Billing always generates
// a bill off this figure (see order.service.js), so delivery charge is
// never folded into it at the database layer. Anywhere a "Total" is
// displayed to a person, it has to add the charge back in, or a delivery
// order's total quietly reads lower than what the customer actually owes.
export function orderGrandTotal(order) {
  return Number(order.totalAmount) + Number(order.deliveryCharge || 0)
}

// How long before a scheduled arrival the kitchen should start cooking, so
// food lands just as the customer sits down (the spec's 7:30 arrival ->
// 7:25 ready example). A display-only default: once staff sets a real
// estimatedReadyTime, that value wins everywhere.
export const SCHEDULED_PREP_LEAD_MINUTES = 30
export const SCHEDULED_READY_BUFFER_MINUTES = 5

/**
 * The three times a scheduled dine-in order needs to show (Part 18.1):
 * when the customer arrives, when the kitchen should start, and when the
 * food should be ready. Returns null for anything that isn't a scheduled
 * dine-in, so callers can render conditionally without repeating the check.
 */
export function getScheduledDineInTimes(order) {
  if (order.orderType !== 'DINE_IN' || !order.scheduledArrivalTime) return null

  const arrival = new Date(order.scheduledArrivalTime)
  // Staff's own estimate takes precedence over the computed default.
  const readyAt = order.estimatedReadyTime
    ? new Date(order.estimatedReadyTime)
    : new Date(arrival.getTime() - SCHEDULED_READY_BUFFER_MINUTES * 60000)
  const prepStartsAt = new Date(readyAt.getTime() - SCHEDULED_PREP_LEAD_MINUTES * 60000)

  return { arrival, prepStartsAt, readyAt }
}

// "Scheduled orders should appear before their preparation time" — true
// once the kitchen ought to be starting, so staff sees it in time to act.
export function isScheduledPrepDue(order) {
  const times = getScheduledDineInTimes(order)
  if (!times) return false
  const isFinished = order.status === 'COMPLETED' || order.status === 'CANCELLED'
  return !isFinished && Date.now() >= times.prepStartsAt.getTime()
}
