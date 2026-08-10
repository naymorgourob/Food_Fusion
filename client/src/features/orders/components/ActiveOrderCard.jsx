import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Radar, Clock, UserRound, ChefHat, Bike, Utensils, ReceiptText } from 'lucide-react'
import { ORDER_STATUS_LABELS, orderGrandTotal } from '@/features/orders/constants'
import { orderNo, money } from '@/utils/format'
import { ROUTES } from '@/constants'

// Same branch rule the backend enforces and OrderProgressTracker draws: a
// delivery order is never "Ready to Serve", and a dine-in/takeaway order is
// never "On the Way".
const FLOW_BY_TYPE = {
  DINE_IN: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  TAKEAWAY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  DELIVERY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'COMPLETED'],
}

const STEP_ICONS = {
  PENDING: ReceiptText,
  ACCEPTED: Check,
  PREPARING: ChefHat,
  READY: Utensils,
  ON_THE_WAY: Bike,
  SERVED: Utensils,
  COMPLETED: Check,
}

/** Minutes until `iso`, or null when it's unset or already past. */
function minutesUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  return Math.round(diff / 60000)
}

/**
 * The dashboard's hero: one in-flight order with its status, a progress
 * bar, the remaining ETA, assigned staff, and a full timeline.
 *
 * Deliberately shows only the single most recent active order. The old
 * dashboard listed all of them as identical rows, which buried the one
 * the customer actually cares about right now; the rest stay one click
 * away under My Orders.
 */
export function ActiveOrderCard({ order }) {
  const flow = FLOW_BY_TYPE[order.orderType] ?? FLOW_BY_TYPE.DINE_IN
  const currentIndex = Math.max(0, flow.indexOf(order.status))
  const progress = ((currentIndex + 1) / flow.length) * 100

  // estimatedDeliveryTime is "arrives with the customer"; estimatedReadyTime
  // is "leaves the kitchen" — delivery cares about the former.
  const etaIso = order.orderType === 'DELIVERY' ? order.estimatedDeliveryTime : order.estimatedReadyTime
  const etaMinutes = minutesUntil(etaIso)

  return (
    <section
      aria-labelledby="active-order-heading"
      className="relative isolate overflow-hidden rounded-3xl bg-brand-800 p-6 text-white shadow-xl shadow-brand-900/20 sm:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 -z-10 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gold-300 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
            </span>
            Order in progress
          </span>
          <h2 id="active-order-heading" className="font-display text-2xl font-semibold sm:text-3xl">
            {ORDER_STATUS_LABELS[order.status]}
          </h2>
          <p className="text-sm text-white/70">
            {orderNo(order.orderNumber)} · {money(orderGrandTotal(order))}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end">
          {etaMinutes !== null ? (
            <>
              <span className="flex items-center gap-1.5 font-display text-2xl font-semibold text-gold-300">
                <Clock className="h-5 w-5" />
                {etaMinutes} min
              </span>
              <span className="text-xs text-white/60">
                {order.orderType === 'DELIVERY' ? 'until delivery' : 'until ready'}
              </span>
            </>
          ) : (
            <span className="text-sm text-white/60">Estimated time coming soon</span>
          )}
        </div>
      </div>

      {/* Progress bar. aria-* makes the same value available to a screen
          reader, which can't read a gradient. */}
      <div className="mt-6">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={`Order progress: ${ORDER_STATUS_LABELS[order.status]}`}
          className="h-2 w-full overflow-hidden rounded-full bg-white/15"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300"
          />
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-6 grid grid-cols-3 gap-y-5 sm:grid-cols-6">
        {flow.map((step, index) => {
          const done = index < currentIndex
          const current = index === currentIndex
          const StepIcon = STEP_ICONS[step] ?? Check

          return (
            <li key={step} className="flex flex-col items-center gap-2 text-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  done
                    ? 'bg-gold-400 text-brand-900'
                    : current
                      ? 'bg-white text-brand-800 ring-4 ring-white/25'
                      : 'bg-white/10 text-white/45'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </span>
              <span className={`text-[0.7rem] leading-tight ${done || current ? 'text-white' : 'text-white/45'}`}>
                {ORDER_STATUS_LABELS[step]}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
        {order.assignedStaff ? (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gold-300">
              <UserRound className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{order.assignedStaff.fullName}</span>
              <span className="text-xs text-white/60">{order.assignedStaff.position ?? 'Your server'}</span>
            </span>
          </div>
        ) : (
          <span className="text-sm text-white/55">A team member will be assigned shortly.</span>
        )}

        <Link
          to={`${ROUTES.ORDERS}/${order.id}`}
          className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Radar className="h-4 w-4" />
          Track order
        </Link>
      </div>
    </section>
  )
}
