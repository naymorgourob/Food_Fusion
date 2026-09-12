import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Clock,
  UtensilsCrossed,
  MapPin,
  Phone,
  ShoppingBag,
  Armchair,
  Bike,
  Receipt,
  ScrollText,
  RotateCcw,
  Radar,
  Tag,
  CreditCard,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { ORDER_STATUS_LABELS, orderGrandTotal } from '@/features/orders/constants'
import { money, orderNo } from '@/utils/format'
import { getImageUrl, ROUTES } from '@/constants'

const ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'])

export function CustomerOrderDrawer({ order, isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!order) return null

  const items = order.items || []
  const bill = order.bill
  const deliveryCharge = Number(order.deliveryCharge || 0)
  const loyaltyDiscount = Number(order.loyaltyDiscount || 0)
  const grandTotal = orderGrandTotal(order)
  const isActive = ACTIVE_STATUSES.has(order.status)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-rule bg-card shadow-2xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-order-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-card/95 px-6 py-4 backdrop-blur-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 id="drawer-order-title" className="font-display text-lg font-bold text-body">
                    Order {orderNo(order.orderNumber)}
                  </h2>
                  <OrderStatusBadge status={order.status} />
                </div>
                <span className="text-xs text-body-muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })} at {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="rounded-full p-2 text-body-muted transition hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Order Type & Fulfilment details */}
              <div className="rounded-2xl border border-rule bg-canvas-2/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                      Fulfilment Method
                    </span>
                  </div>
                  <OrderTypeBadge orderType={order.orderType} />
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-rule/50 pt-3 text-xs text-body-muted">
                  {order.orderType === 'DINE_IN' && (
                    <div className="flex items-center gap-2">
                      <Armchair className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none" />
                      <span>
                        {order.table?.number ? `Table #${order.table.number}` : 'Dining Room'}
                        {order.guestCount ? ` · ${order.guestCount} Guests` : ''}
                      </span>
                    </div>
                  )}

                  {order.orderType === 'DELIVERY' && (
                    <>
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      )}
                      {order.deliveryPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none" />
                          <span>{order.deliveryPhone}</span>
                        </div>
                      )}
                    </>
                  )}

                  {order.orderType === 'TAKEAWAY' && (
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none" />
                      <span>
                        {order.scheduledPickupTime
                          ? `Scheduled Pickup: ${new Date(order.scheduledPickupTime).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}`
                          : 'Pickup at counter'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-body">Items Ordered</h3>
                  <span className="text-xs text-body-muted">
                    {items.reduce((sum, it) => sum + it.quantity, 0)} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-rule/60 rounded-2xl border border-rule bg-card">
                  {items.map((item) => {
                    const imageUrl = getImageUrl(item.menuItem?.imageUrl)
                    return (
                      <div key={item.id} className="flex items-start gap-3.5 p-3.5">
                        <div className="h-12 w-12 flex-none overflow-hidden rounded-xl bg-canvas-2 border border-rule/50">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.menuItem?.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-body-faint">
                              <UtensilsCrossed className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium text-xs sm:text-sm text-body truncate">
                            {item.menuItem?.name || 'Dish'}
                          </span>
                          <span className="text-xs text-body-muted">
                            {money(item.unitPrice)} × {item.quantity}
                          </span>
                          {item.specialInstructions && (
                            <span className="mt-1 text-[0.7rem] text-gold-600 dark:text-gold-400 italic">
                              &ldquo;{item.specialInstructions}&rdquo;
                            </span>
                          )}
                        </div>

                        <span className="font-semibold text-xs sm:text-sm text-body">
                          {money(item.subtotal)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Special Instructions / Kitchen Note */}
              {order.specialInstructions && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                    <ScrollText className="h-4 w-4" />
                    <span>Special Instructions</span>
                  </div>
                  <p className="text-body-muted leading-relaxed">{order.specialInstructions}</p>
                </div>
              )}

              {/* Billing Summary */}
              <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                <h3 className="font-display text-sm font-semibold text-body">Payment & Summary</h3>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-body-muted">
                    <span>Food Subtotal</span>
                    <span>{money(order.totalAmount)}</span>
                  </div>

                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-body-muted">
                      <span>Delivery Fee</span>
                      <span>{money(deliveryCharge)}</span>
                    </div>
                  )}

                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        Loyalty Discount ({order.pointsRedeemed} pts)
                      </span>
                      <span>-{money(loyaltyDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-rule pt-2.5 text-sm font-bold text-body">
                    <span>Total Amount</span>
                    <span className="text-gold-600 dark:text-gold-400">{money(grandTotal)}</span>
                  </div>
                </div>

                {/* Invoiced bill status if available */}
                {bill && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-canvas-2 p-3 text-xs border border-rule/50">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-body-muted" />
                      <div>
                        <span className="font-semibold text-body block">Invoice #{bill.billNumber}</span>
                        <span className="text-[0.7rem] text-body-faint">
                          {bill.paymentStatus === 'PAID' ? 'Payment Completed' : 'Payment Pending'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                        bill.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-rule bg-card/95 p-4 backdrop-blur-md">
              {isActive ? (
                <Link
                  to={`${ROUTES.ORDERS}/${order.id}`}
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98]"
                >
                  <Radar className="h-4 w-4" />
                  Track Live Order
                </Link>
              ) : (
                <Link
                  to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Order Again
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-rule bg-card px-4 py-2.5 text-xs font-semibold text-body transition hover:bg-canvas-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

