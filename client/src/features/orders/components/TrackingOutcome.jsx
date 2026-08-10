import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PartyPopper, XCircle, RotateCcw, LifeBuoy, UtensilsCrossed } from 'lucide-react'
import { ROUTES } from '@/constants'

/**
 * Terminal-state panels (UI-05): the celebration when an order completes,
 * and the explanation when one is cancelled.
 *
 * "Rate your experience / leave a review" was requested for the completed
 * state. There is no review or rating model in the schema and no endpoint
 * to post one to, so a star widget here would either silently discard the
 * customer's rating or need a backend change. Instead the panel offers the
 * two things that genuinely work and that a happy customer actually wants:
 * order it again, or browse the menu.
 */

export function OrderCompletedPanel({ order }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="order-complete-heading"
      className="relative isolate flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-rule bg-card p-7 text-center sm:p-9"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl"
      />

      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
        className="relative flex h-20 w-20 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/50" />
        <span className="absolute inset-2.5 rounded-full bg-brand-700" />
        <PartyPopper className="relative h-8 w-8 text-gold-300" strokeWidth={1.75} />
      </motion.span>

      <div className="flex flex-col gap-2">
        <h2 id="order-complete-heading" className="font-display text-2xl font-semibold text-body">
          Order completed
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-body-muted">
          Thank you for dining with FoodFusion. We hope every bite was worth the wait — we&rsquo;d
          love to cook for you again.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <RotateCcw className="h-4 w-4" />
          Order this again
        </Link>
        <Link
          to={`${ROUTES.ORDERS}/new`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rule px-6 py-3 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <UtensilsCrossed className="h-4 w-4" />
          Browse the menu
        </Link>
      </div>
    </motion.section>
  )
}

export function OrderCancelledPanel({ order }) {
  const cancelledAt = order.cancelledAt
    ? new Date(order.cancelledAt).toLocaleString([], {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <section
      aria-labelledby="order-cancelled-heading"
      className="flex flex-col gap-5 rounded-3xl border border-red-200 bg-red-50 p-7 dark:border-red-900/50 dark:bg-red-900/20 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <XCircle className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2
            id="order-cancelled-heading"
            className="font-display text-xl font-semibold text-red-800 dark:text-red-200"
          >
            This order was cancelled
          </h2>
          {/* The schema records *when* an order was cancelled but not why —
              there is no cancellation-reason column — so this states the
              fact it has rather than inventing a reason. */}
          <p className="text-sm leading-relaxed text-red-700 dark:text-red-300">
            {cancelledAt
              ? `Cancelled on ${cancelledAt}. Nothing has been charged.`
              : 'Nothing has been charged for this order.'}{' '}
            If this wasn&rsquo;t expected, the restaurant can tell you more.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link
          to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <RotateCcw className="h-4 w-4" />
          Order it again
        </Link>
        <Link
          to={`${ROUTES.ORDERS}/new`}
          className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          <UtensilsCrossed className="h-4 w-4" />
          Back to the menu
        </Link>
        <a
          href="tel:+8801700000000"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          <LifeBuoy className="h-4 w-4" />
          Contact the restaurant
        </a>
      </div>
    </section>
  )
}
