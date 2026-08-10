import { MapPin, Phone, Clock, Users, UtensilsCrossed, Bike, ShoppingBag, ChefHat } from 'lucide-react'
import { getScheduledDineInTimes } from '@/features/orders/constants'

/**
 * The "where and when" card (UI-05) — shows only what the order type
 * actually has.
 *
 * Previously this was three separate ad-hoc blocks scattered down the
 * page (a delivery div, a scheduled dine-in card, a special-instructions
 * div), so a customer had to scan the whole page to find their address.
 * One card, one place.
 *
 * Pickup counter was requested for takeaway. There is no counter/station
 * field on Order, so rather than invent a counter number the card points
 * to the real collection point: the front desk.
 */

const TYPE_META = {
  DINE_IN: { label: 'Dine-in', icon: UtensilsCrossed },
  DELIVERY: { label: 'Delivery', icon: Bike },
  TAKEAWAY: { label: 'Takeaway', icon: ShoppingBag },
}

function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatClock(value) {
  if (!value) return null
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function Row({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">{label}</span>
        <span className="text-sm break-words text-body">{children}</span>
      </div>
    </div>
  )
}

export function TrackingFulfilment({ order }) {
  const meta = TYPE_META[order.orderType] ?? TYPE_META.DINE_IN
  const scheduled = getScheduledDineInTimes(order)

  return (
    <section
      aria-labelledby="tracking-fulfilment-heading"
      className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5"
    >
      <h2
        id="tracking-fulfilment-heading"
        className="flex items-center gap-2 font-display text-lg font-semibold text-body"
      >
        <meta.icon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
        {meta.label}
      </h2>

      <div className="flex flex-col gap-3.5">
        {order.orderType === 'DELIVERY' && (
          <>
            <Row icon={MapPin} label="Delivering to">
              {order.deliveryAddress}
            </Row>
            <Row icon={Phone} label="Contact">
              {order.deliveryPhone}
            </Row>
            <Row icon={Clock} label="Estimated arrival">
              {formatDateTime(order.estimatedDeliveryTime) ?? 'Confirmed once your order is accepted'}
            </Row>
          </>
        )}

        {order.orderType === 'TAKEAWAY' && (
          <>
            <Row icon={Clock} label="Pickup time">
              {formatDateTime(order.scheduledPickupTime) ?? 'As soon as it is ready'}
            </Row>
            <Row icon={ShoppingBag} label="Collect from">
              The front desk — quote your order number
            </Row>
            <Row icon={ChefHat} label="Estimated ready">
              {formatDateTime(order.estimatedReadyTime) ?? 'Confirmed once your order is accepted'}
            </Row>
          </>
        )}

        {order.orderType === 'DINE_IN' && (
          <>
            {scheduled ? (
              <>
                <Row icon={Clock} label="Arriving">
                  {formatDateTime(order.scheduledArrivalTime)}
                </Row>
                <Row icon={ChefHat} label="Kitchen starts">
                  {formatClock(scheduled.prepStartsAt)}
                </Row>
                <Row icon={UtensilsCrossed} label="Food ready">
                  {formatClock(scheduled.readyAt)}
                </Row>
                <Row icon={Users} label="Guests">
                  {order.guestCount ? `${order.guestCount} ${order.guestCount === 1 ? 'guest' : 'guests'}` : null}
                </Row>
              </>
            ) : (
              <Row icon={Clock} label="Seating">
                Dining with us now
              </Row>
            )}

            <Row icon={UtensilsCrossed} label="Table">
              {order.table ? `Table ${order.table.number}` : 'Assigned when you arrive'}
            </Row>
          </>
        )}
      </div>
    </section>
  )
}
