import { useMemo } from 'react'
import { ReceiptText, Utensils, CalendarClock } from 'lucide-react'
import { ROUTES } from '@/constants'
import { orderNo } from '@/utils/format'

/**
 * Derives Staff's notification feed from orders and reservations they can
 * already read — no notifications table exists, so nothing here is
 * invented; it's a live order or booking that genuinely needs attention.
 *
 * The spec listed four notification types: New Order, Reservation,
 * Inventory Alert, Customer Request. Inventory Alert is intentionally
 * absent — GET /inventory is authorizeAdmin, so Staff cannot read stock
 * levels at all, and a notification about data Staff can't open would be
 * a dead end. "Customer Request" has no backing signal either (no
 * messaging/request model), so it's covered by surfacing each order's own
 * specialInstructions instead, which is the real equivalent.
 */
export function useStaffNotifications({ orders = [], reservations = [] }) {
  return useMemo(() => {
    const items = []

    for (const order of orders) {
      if (order.status === 'PENDING') {
        items.push({
          id: `order-new-${order.id}`,
          icon: ReceiptText,
          tone: 'bg-gold-100 text-gold-700',
          title: 'New order',
          description: `${orderNo(order.orderNumber)} from ${order.customer?.fullName ?? 'a customer'} needs accepting.`,
          to: ROUTES.STAFF_KITCHEN,
          at: new Date(order.createdAt).getTime(),
        })
      }

      if (order.specialInstructions) {
        items.push({
          id: `order-request-${order.id}`,
          icon: Utensils,
          tone: 'bg-brand-50 text-brand-700',
          title: 'Customer request',
          description: `${orderNo(order.orderNumber)}: “${order.specialInstructions}”`,
          to: ROUTES.STAFF_KITCHEN,
          at: new Date(order.updatedAt ?? order.createdAt).getTime(),
        })
      }
    }

    for (const reservation of reservations) {
      if (reservation.status !== 'PENDING') continue
      items.push({
        id: `res-${reservation.id}`,
        icon: CalendarClock,
        tone: 'bg-gold-100 text-gold-700',
        title: 'Reservation pending',
        description: `${reservation.customerName} · ${new Date(
          reservation.reservationDate,
        ).toLocaleDateString()} at ${reservation.reservationTime}.`,
        to: ROUTES.STAFF_RESERVATIONS,
        at: new Date(reservation.createdAt).getTime(),
      })
    }

    return items.sort((a, b) => b.at - a.at).slice(0, 8)
  }, [orders, reservations])
}
