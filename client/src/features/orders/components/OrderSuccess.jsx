import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Radar, LayoutDashboard, UtensilsCrossed, Clock, Receipt } from 'lucide-react'
import { money, orderNo } from '@/utils/format'
import { ROUTES } from '@/constants'

/**
 * Post-submit confirmation (UI-04).
 *
 * Shown in place of an immediate redirect to tracking. The old flow jumped
 * straight to the tracking page, which meant the order number and total
 * flashed past — this holds that information still for a moment and then
 * lets the customer choose where to go.
 *
 * Payment status is read from the order's real state rather than asserted:
 * a bill doesn't exist yet at this point (staff generate it later), so
 * this says payment is due at the restaurant instead of claiming "Paid".
 */
export function OrderSuccess({ order, total, paymentLabel }) {
  const eta = order.estimatedDeliveryTime ?? order.estimatedReadyTime
  const etaLabel = eta
    ? new Date(eta).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-7 py-6 text-center">
      {/* --- Success mark ---------------------------------------------- */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        <motion.span
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.25, opacity: 0 }}
          transition={{ duration: 1.1, repeat: 1, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-brand-400"
        />
        <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/50" />
        <span className="absolute inset-3 rounded-full bg-brand-700" />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 400, damping: 16 }}
          className="relative text-white"
        >
          <Check className="h-9 w-9" strokeWidth={3} />
        </motion.span>
      </motion.div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">
          Order confirmed
        </h1>
        <p className="text-sm leading-relaxed text-body-muted">
          Thank you — the kitchen has your order and will start on it shortly.
        </p>
      </div>

      {/* --- Receipt --------------------------------------------------- */}
      <dl className="flex w-full flex-col gap-3 rounded-2xl border border-rule bg-card p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-sm text-body-muted">
            <Receipt className="h-4 w-4 text-brand-700 dark:text-brand-400" />
            Order number
          </dt>
          <dd className="font-display text-base font-semibold text-body">
            {orderNo(order.orderNumber)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-sm text-body-muted">
            <Clock className="h-4 w-4 text-brand-700 dark:text-brand-400" />
            {order.orderType === 'DELIVERY' ? 'Estimated delivery' : 'Estimated ready'}
          </dt>
          <dd className="text-sm font-medium text-body">
            {etaLabel ?? 'Confirmed once accepted'}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-rule pt-3">
          <dt className="text-sm text-body-muted">Payment</dt>
          <dd className="flex flex-col items-end">
            <span className="text-sm font-medium text-body">{paymentLabel}</span>
            <span className="text-xs text-body-faint">Due at the restaurant</span>
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-rule pt-3">
          <dt className="font-display text-sm font-semibold text-body">Total</dt>
          <dd className="font-display text-xl font-semibold text-brand-700 dark:text-brand-400">
            {money(total)}
          </dd>
        </div>
      </dl>

      {/* --- Onward journeys -------------------------------------------- */}
      <div className="flex w-full flex-col gap-3">
        <Link
          to={`${ROUTES.ORDERS}/${order.id}`}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Radar className="h-4 w-4" />
          Track your order
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={ROUTES.ACCOUNT}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to={`${ROUTES.ORDERS}/new`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Order more
          </Link>
        </div>
      </div>
    </div>
  )
}
