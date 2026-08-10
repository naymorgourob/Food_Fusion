import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  RefreshCw,
  Receipt,
  Phone,
  RotateCcw,
  LayoutDashboard,
  PackageX,
  ChevronRight,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { TrackingHero } from '@/features/orders/components/TrackingHero'
import { TrackingTimeline } from '@/features/orders/components/TrackingTimeline'
import { TrackingSummary } from '@/features/orders/components/TrackingSummary'
import { TrackingFulfilment } from '@/features/orders/components/TrackingFulfilment'
import { TrackingActivity } from '@/features/orders/components/TrackingActivity'
import { OrderCompletedPanel, OrderCancelledPanel } from '@/features/orders/components/TrackingOutcome'
import { EmptyState, Skeleton } from '@/components/customer/ui'
import * as orderService from '@/features/orders/services/orderService'
import { ROUTES } from '@/constants'

// Cancellation window matches order.service.js's cancelOrder guard exactly
// — kept in sync deliberately so the button only ever appears when the
// server would actually accept the cancellation.
const CANCELLABLE_STATUSES = new Set(['PENDING', 'ACCEPTED'])

// "Customer automatically sees the updated value" (Part 18) — implemented
// as polling, not WebSockets (no real-time library is in the approved
// stack). 10s is frequent enough to feel live without hammering the API.
const POLL_INTERVAL_MS = 10000

// Once an order reaches a terminal state nothing about it can change, so
// the poll stops rather than re-requesting an identical payload forever.
const FINISHED = new Set(['COMPLETED', 'CANCELLED'])

function TrackingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Loading your order…</span>
    </div>
  )
}

/**
 * Live order tracking (UI-05 redesign).
 *
 * The data contract is unchanged: the same fetchOrderById poll and the
 * same cancelOrder call, with the same cancellation window. What changed
 * is the presentation — a progress ring and plain-language status answer
 * "what is happening and how long" at a glance, instead of making the
 * customer read a status enum off a badge and infer the rest from a flat
 * list of stages.
 */
export default function OrderTrackingPage() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  // Read by the interval so it can stop itself without re-subscribing on
  // every status change.
  const statusRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await orderService.fetchOrderById(id)
      setOrder(data)
      statusRef.current = data.status
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load this order.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const data = await orderService.fetchOrderById(id)
        if (cancelled) return
        setOrder(data)
        statusRef.current = data.status
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load this order.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    poll()
    const interval = setInterval(() => {
      if (statusRef.current && FINISHED.has(statusRef.current)) return
      poll()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [id])

  async function handleManualRefresh() {
    setIsRefreshing(true)
    await load()
    setIsRefreshing(false)
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      const updated = await orderService.cancelOrder(id)
      setOrder(updated)
      statusRef.current = updated.status
      setIsCancelDialogOpen(false)
    } catch (err) {
      setCancelError(err.response?.data?.message ?? 'Failed to cancel order.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) return <TrackingSkeleton />

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-2xl py-10">
        <EmptyState
          icon={PackageX}
          title="We couldn't find this order"
          description={error ?? 'It may have been removed, or the link may be incorrect.'}
          actionLabel="Back to my orders"
          to={ROUTES.ORDERS}
        />
      </div>
    )
  }

  const isCancellable = CANCELLABLE_STATUSES.has(order.status)
  const placedOn = new Date(order.createdAt).toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
    >
      {/* --- Breadcrumb + meta ---------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs font-medium text-body-faint">
              <li>
                <Link
                  to={ROUTES.ORDERS}
                  className="transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                >
                  My orders
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-body-muted">
                Tracking
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm text-body-muted">Placed {placedOn}</span>
            <OrderTypeBadge orderType={order.orderType} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 disabled:opacity-60 dark:hover:text-brand-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* --- Terminal state, or the live hero -------------------------- */}
      {order.status === 'COMPLETED' ? (
        <OrderCompletedPanel order={order} />
      ) : order.status === 'CANCELLED' ? (
        <OrderCancelledPanel order={order} />
      ) : (
        <TrackingHero order={order} />
      )}

      {/* --- Detail grid ----------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="rounded-2xl border border-rule bg-card p-5 sm:p-6">
          <TrackingTimeline order={order} />
        </div>

        <div className="flex flex-col gap-6">
          <TrackingSummary order={order} />
          <TrackingFulfilment order={order} />
          <TrackingActivity order={order} />
        </div>
      </div>

      {/* --- Actions ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-rule bg-card p-4">
        <Link
          to={ROUTES.ORDERS}
          className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          My orders
        </Link>

        <Link
          to={ROUTES.ACCOUNT}
          className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Only offered once a bill actually exists — before staff
            generate one there is nothing to view. */}
        {order.bill && (
          <Link
            to={ROUTES.BILLS}
            className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Receipt className="h-4 w-4" />
            View invoice
          </Link>
        )}

        <Link
          to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <RotateCcw className="h-4 w-4" />
          Reorder
        </Link>

        <a
          href="tel:+8801700000000"
          className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <Phone className="h-4 w-4" />
          Contact restaurant
        </a>

        {isCancellable && (
          <button
            type="button"
            onClick={() => {
              setCancelError('')
              setIsCancelDialogOpen(true)
            }}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Cancel order
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message="Cancel this order? This cannot be undone."
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep Order"
        confirmLabel="Cancel Order"
        confirmingLabel="Cancelling…"
      />
    </motion.div>
  )
}
