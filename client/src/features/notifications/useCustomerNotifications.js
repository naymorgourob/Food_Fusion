import { useMemo } from 'react'
import { ChefHat, Bike, CheckCircle2, CalendarCheck, Sparkles } from 'lucide-react'
import { ROUTES } from '@/constants'

// There is no notifications table in this project, and inventing one would
// mean backend changes this redesign is not allowed to make. So the feed is
// *derived* from data the dashboard already holds — a real order that just
// moved to PREPARING genuinely is the notification. Nothing is fabricated.
const ORDER_NOTIFICATIONS = {
  ACCEPTED: {
    icon: CheckCircle2,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Order accepted',
    describe: (n) => `Order #${n} is confirmed by the kitchen.`,
  },
  PREPARING: {
    icon: ChefHat,
    tone: 'bg-gold-100 text-gold-700',
    title: 'Preparing your order',
    describe: (n) => `The chef has started on order #${n}.`,
  },
  READY: {
    icon: CheckCircle2,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Order ready',
    describe: (n) => `Order #${n} is ready.`,
  },
  ON_THE_WAY: {
    icon: Bike,
    tone: 'bg-gold-100 text-gold-700',
    title: 'Out for delivery',
    describe: (n) => `Order #${n} is on its way to you.`,
  },
  SERVED: {
    icon: CheckCircle2,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Ready to serve',
    describe: (n) => `Order #${n} is at your table.`,
  },
}

const padded = (value) => String(value).padStart(6, '0')

/**
 * Builds the notification list from live orders, reservations, and the
 * loyalty ledger. Newest-relevant first, capped so the dropdown never
 * becomes a scroll marathon.
 */
export function useCustomerNotifications({ orders = [], reservations = [], loyaltySummary }) {
  return useMemo(() => {
    const items = []

    for (const order of orders) {
      const meta = ORDER_NOTIFICATIONS[order.status]
      if (!meta) continue
      items.push({
        id: `order-${order.id}`,
        icon: meta.icon,
        tone: meta.tone,
        title: meta.title,
        description: meta.describe(padded(order.orderNumber)),
        to: `${ROUTES.ORDERS}/${order.id}`,
        at: new Date(order.updatedAt ?? order.createdAt).getTime(),
      })
    }

    for (const reservation of reservations) {
      if (reservation.status !== 'CONFIRMED') continue
      items.push({
        id: `res-${reservation.id}`,
        icon: CalendarCheck,
        tone: 'bg-brand-50 text-brand-700',
        title: 'Reservation confirmed',
        description: `Table ${reservation.table?.number} on ${new Date(
          reservation.reservationDate,
        ).toLocaleDateString()} at ${reservation.reservationTime}.`,
        to: ROUTES.RESERVATIONS,
        at: new Date(reservation.updatedAt ?? reservation.createdAt).getTime(),
      })
    }

    if (loyaltySummary?.currentPoints > 0) {
      items.push({
        id: 'loyalty',
        icon: Sparkles,
        tone: 'bg-gold-100 text-gold-700',
        title: 'Loyalty points earned',
        description: `You have ${loyaltySummary.currentPoints} points to spend.`,
        to: ROUTES.LOYALTY,
        at: 0, // always sorts last — it's a standing balance, not an event
      })
    }

    return items.sort((a, b) => b.at - a.at).slice(0, 6)
  }, [orders, reservations, loyaltySummary])
}
