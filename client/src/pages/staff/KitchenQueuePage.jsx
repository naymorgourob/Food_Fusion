import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChefHat, Utensils, CalendarClock } from 'lucide-react'
import { KitchenOrderCard } from '@/features/orders/components/KitchenOrderCard'
import { updateOrderStatus } from '@/features/orders/services/orderService'
import { getScheduledDineInTimes, isScheduledPrepDue } from '@/features/orders/constants'
import { KITCHEN_ACTIVE_STATUSES, minutesWaiting, priorityFor } from '@/features/orders/staffOrderHelpers'
import { orderNo } from '@/utils/format'
import { Card, SectionTitle, SkeletonCard, EmptyState } from '@/components/customer/ui'

const PRIORITY_RANK = { high: 0, medium: 1, normal: 2 }

/**
 * The Kitchen Queue (UI-07) — every order the kitchen still owes food to,
 * sorted so the most urgent is always first.
 *
 * Reuses useOrders (already fetched once by StaffLayout) and
 * updateOrderStatus, unchanged. "Start Cooking" and "Mark Ready" are the
 * existing PUT /orders/:id status transition, just presented as one-tap
 * buttons instead of a dropdown inside a modal — the same data, a faster
 * path to it.
 */
export default function KitchenQueuePage() {
  const { orders } = useOutletContext()
  const [updatingId, setUpdatingId] = useState(null)

  const active = orders.orders
    .filter((order) => KITCHEN_ACTIVE_STATUSES.has(order.status))
    .sort((a, b) => {
      const rank = PRIORITY_RANK[priorityFor(a)] - PRIORITY_RANK[priorityFor(b)]
      if (rank !== 0) return rank
      return minutesWaiting(b) - minutesWaiting(a) // longest-waiting first within the same priority
    })

  // Scheduled dine-ins whose kitchen prep window has opened — the exact
  // rule OrdersPage already flags inline; here it gets its own section
  // because the spec asked for scheduled dine-in to be a dedicated,
  // visible part of the kitchen's day rather than a badge in a table row.
  const scheduled = orders.orders.filter((order) => {
    const times = getScheduledDineInTimes(order)
    return times && !['COMPLETED', 'CANCELLED'].includes(order.status)
  })

  async function handleAdvance(order, status) {
    setUpdatingId(order.id)
    try {
      await updateOrderStatus(order.id, status)
      orders.refetch()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Kitchen Queue</h1>
        <p className="text-sm text-body-muted">
          {active.length} active {active.length === 1 ? 'order' : 'orders'} — sorted by urgency.
        </p>
      </div>

      {/* --- Scheduled dine-in ------------------------------------------ */}
      {scheduled.length > 0 && (
        <section aria-labelledby="scheduled-heading" className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-gold-500" />
            <h2 id="scheduled-heading" className="font-display text-lg font-semibold text-body">
              Scheduled dine-in
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scheduled.map((order) => {
              const times = getScheduledDineInTimes(order)
              const prepDue = isScheduledPrepDue(order)
              return (
                <Card
                  key={order.id}
                  className={`flex flex-col gap-2.5 p-4 ${prepDue ? 'border-gold-400 bg-gold-100/30 dark:bg-gold-100/5' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-body">{orderNo(order.orderNumber)}</span>
                    {prepDue && (
                      <span className="flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[0.65rem] font-bold text-charcoal">
                        <ChefHat className="h-3 w-3" />
                        Start prep now
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-body-muted">{order.customer.fullName}</p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-body-faint">Arrival</dt>
                    <dd className="text-body">
                      {times.arrival.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </dd>
                    <dt className="text-body-faint">Guests</dt>
                    <dd className="text-body">{order.guestCount ?? '—'}</dd>
                    <dt className="text-body-faint">Kitchen starts</dt>
                    <dd className="text-body">
                      {times.prepStartsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </dd>
                    <dt className="text-body-faint">Food ready</dt>
                    <dd className="text-body">
                      {times.readyAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </dd>
                  </dl>
                  <p className="flex items-center gap-1.5 text-xs text-body-faint">
                    <Utensils className="h-3 w-3" />
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} pre-ordered items
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* --- Active queue ------------------------------------------------ */}
      <section aria-labelledby="queue-heading" className="flex flex-col gap-4">
        <SectionTitle>Active orders</SectionTitle>

        {orders.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="Queue is clear"
            description="No active orders right now — new ones will appear here the moment they come in."
          />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {active.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onAdvance={handleAdvance}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}
