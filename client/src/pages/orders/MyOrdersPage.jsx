import { useState, useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Radar,
  RotateCcw,
  Eye,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Check,
  Bike,
  ChefHat,
  ReceiptText,
} from 'lucide-react'
import { Card, SectionTitle, SkeletonCard, EmptyState, Rise } from '@/components/customer/ui'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { CustomerOrderDrawer } from '@/features/orders/components/CustomerOrderDrawer'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { ORDER_STATUS_LABELS, orderGrandTotal } from '@/features/orders/constants'
import { money, orderNo } from '@/utils/format'
import { ROUTES } from '@/constants'

const ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'])

const FLOW_BY_TYPE = {
  DINE_IN: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  TAKEAWAY: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  DELIVERY: ['PENDING', 'PREPARING', 'READY', 'ON_THE_WAY', 'COMPLETED'],
}

const STEP_ICONS = {
  PENDING: ReceiptText,
  ACCEPTED: ChefHat,
  PREPARING: ChefHat,
  READY: UtensilsCrossed,
  ON_THE_WAY: Bike,
  SERVED: UtensilsCrossed,
  COMPLETED: Check,
}

function formatEta(order) {
  const etaIso = order.orderType === 'DELIVERY' ? order.estimatedDeliveryTime : order.estimatedReadyTime
  if (!etaIso) return null
  const diff = new Date(etaIso).getTime() - Date.now()
  if (diff <= 0) return 'Arriving shortly'
  const mins = Math.round(diff / 60000)
  return `~${mins} min`
}

export default function MyOrdersPage() {
  // Use outlet context if provided by CustomerLayout, otherwise fall back to useOrders hook
  const outlet = useOutletContext()
  const localOrdersState = useOrders()
  const { orders = [], isLoading, error, refetch } = outlet?.orders || localOrdersState

  const [viewingOrder, setViewingOrder] = useState(null)

  // Split into active orders and order history
  const { activeOrders, pastOrders } = useMemo(() => {
    const active = []
    const past = []
    for (const order of orders) {
      if (ACTIVE_STATUSES.has(order.status)) {
        active.push(order)
      } else {
        past.push(order)
      }
    }
    return { activeOrders: active, pastOrders: past }
  }, [orders])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-body">
            My Orders
          </h1>
          <p className="text-sm text-body-muted">
            Your orders and their current status.
          </p>
        </div>

        <Link
          to={`${ROUTES.ORDERS}/new`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Place New Order
        </Link>
      </div>

      {/* --- Error State --- */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200/80 bg-red-50/60 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 flex-none" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg bg-red-100 dark:bg-red-900/50 px-3 py-1 font-semibold hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* --- Loading State --- */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          <SkeletonCard lines={4} />
          <div className="flex flex-col gap-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        </div>
      ) : orders.length === 0 ? (
        /* --- Empty State --- */
        <EmptyState
          icon={ShoppingBag}
          title="Your order history is empty."
          description="You haven't placed any orders yet. Discover our handcrafted culinary creations and experience fine dining at your convenience."
          actionLabel="Browse Menu"
          to={`${ROUTES.ORDERS}/new`}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* --- ACTIVE ORDERS (Prominently at the top) --- */}
          {activeOrders.length > 0 && (
            <section aria-labelledby="active-orders-heading" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 id="active-orders-heading" className="font-display text-base sm:text-lg font-semibold text-body">
                    Active Order
                  </h2>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {activeOrders.map((order) => {
                  const etaText = formatEta(order)
                  const flow = FLOW_BY_TYPE[order.orderType] || FLOW_BY_TYPE.DINE_IN
                  // Map ACCEPTED to index of PREPARING if not in flow
                  const mappedStatus = order.status === 'ACCEPTED' ? 'PREPARING' : order.status
                  const currentIndex = Math.max(0, flow.indexOf(mappedStatus))
                  const itemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0
                  const itemsSummary = order.items
                    ?.map((it) => `${it.menuItem?.name || 'Dish'} ×${it.quantity}`)
                    .join(', ')

                  return (
                    <motion.article
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-900/10 via-card to-card p-5 sm:p-6 shadow-md shadow-brand-950/5"
                    >
                      {/* Top Bar: Order ID, Date, Total & ETA */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-rule/60 pb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-lg font-bold text-body">
                              Order {orderNo(order.orderNumber)}
                            </span>
                            <OrderTypeBadge orderType={order.orderType} />
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <span className="text-xs text-body-muted">
                            Placed on {new Date(order.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })} at {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center sm:items-end sm:flex-col justify-between gap-1">
                          <span className="font-display text-lg sm:text-xl font-bold text-body">
                            {money(orderGrandTotal(order))}
                          </span>
                          {etaText ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 dark:text-gold-400">
                              <Clock className="h-3.5 w-3.5" />
                              Estimated: {etaText}
                            </span>
                          ) : (
                            <span className="text-xs text-body-faint">
                              {order.orderType === 'DINE_IN' && order.table?.number
                                ? `Table #${order.table.number}`
                                : 'Kitchen is preparing'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Summary Line */}
                      <div className="mt-3.5 flex items-center justify-between text-xs text-body-muted">
                        <span className="line-clamp-1 flex-1 pr-3">
                          <strong className="text-body font-semibold">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}: </strong>
                          {itemsSummary}
                        </span>
                      </div>

                      {/* Progress Tracker Steps */}
                      <div className="mt-6 pt-4 border-t border-rule/50">
                        <div className="grid grid-cols-5 gap-1 text-center">
                          {flow.map((step, idx) => {
                            const isDone = idx < currentIndex
                            const isCurrent = idx === currentIndex
                            const Icon = STEP_ICONS[step] || Check

                            return (
                              <div key={step} className="flex flex-col items-center gap-1.5">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                                    isDone
                                      ? 'bg-brand-700 text-white'
                                      : isCurrent
                                      ? 'bg-gold-500 text-charcoal ring-4 ring-gold-500/20 shadow-xs'
                                      : 'bg-canvas-2 text-body-faint'
                                  }`}
                                >
                                  {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Icon className="h-3.5 w-3.5" />}
                                </div>
                                <span
                                  className={`text-[0.65rem] sm:text-xs leading-tight ${
                                    isCurrent
                                      ? 'font-bold text-body'
                                      : isDone
                                      ? 'font-medium text-body-muted'
                                      : 'text-body-faint'
                                  }`}
                                >
                                  {ORDER_STATUS_LABELS[step]}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-rule/60">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3.5 py-2 text-xs font-semibold text-body transition hover:bg-canvas-2"
                        >
                          <Eye className="h-3.5 w-3.5 text-body-muted" />
                          View Details
                        </button>

                        <Link
                          to={`${ROUTES.ORDERS}/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-800 active:scale-[0.98]"
                        >
                          <Radar className="h-3.5 w-3.5" />
                          Track Order
                        </Link>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </section>
          )}

          {/* --- ORDER HISTORY (Clean compact list/card layout) --- */}
          <section aria-labelledby="order-history-heading" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 id="order-history-heading" className="font-display text-base sm:text-lg font-semibold text-body">
                {activeOrders.length > 0 ? 'Past Orders' : 'All Orders'}
              </h2>
              <span className="text-xs text-body-muted">
                {pastOrders.length} {pastOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {pastOrders.length === 0 ? (
              activeOrders.length > 0 ? (
                <div className="rounded-2xl border border-dashed border-rule p-8 text-center text-xs text-body-muted">
                  No previous orders found. Your active order is in progress above.
                </div>
              ) : null
            ) : (
              <div className="flex flex-col divide-y divide-rule rounded-2xl border border-rule bg-card shadow-xs">
                {pastOrders.map((order) => {
                  const itemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0
                  const itemsSummary = order.items
                    ?.map((it) => `${it.menuItem?.name || 'Dish'} ×${it.quantity}`)
                    .join(', ')

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 transition hover:bg-canvas-2/40"
                    >
                      {/* Left: Reference, Date, Summary */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-sm font-bold text-body">
                            Order {orderNo(order.orderNumber)}
                          </span>
                          <OrderTypeBadge orderType={order.orderType} />
                          <OrderStatusBadge status={order.status} />
                        </div>

                        <span className="text-xs text-body-faint">
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          · {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>

                        <p className="mt-0.5 line-clamp-1 text-xs text-body-muted">
                          {itemsSummary}
                        </p>
                      </div>

                      {/* Right: Total Amount & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 flex-none border-t sm:border-t-0 border-rule/50 pt-2 sm:pt-0">
                        <span className="font-display text-sm font-bold text-body">
                          {money(orderGrandTotal(order))}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rule bg-card px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-canvas-2 transition"
                          >
                            <Eye className="h-3 w-3 text-body-muted" />
                            Details
                          </button>

                          <Link
                            to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-canvas-2 px-2.5 py-1.5 text-xs font-semibold text-body-muted hover:text-body transition"
                            title="Repeat this order"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span className="hidden sm:inline">Order Again</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* --- Customer Order Details Drawer --- */}
      <CustomerOrderDrawer
        isOpen={Boolean(viewingOrder)}
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  )
}
