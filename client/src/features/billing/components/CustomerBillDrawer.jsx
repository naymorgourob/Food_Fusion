import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Receipt,
  UtensilsCrossed,
  Printer,
  Calendar,
  CreditCard,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { money, orderNo } from '@/utils/format'
import { getImageUrl, ROUTES } from '@/constants'

export function CustomerBillDrawer({ bill, isOpen, onClose, onViewReceipt }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!bill) return null

  const order = bill.order
  const items = order?.items || []

  // Derive human-readable payment method description based on order type
  const paymentMethodLabel =
    order?.orderType === 'DINE_IN'
      ? 'Pay at Table / Counter'
      : order?.orderType === 'DELIVERY'
      ? 'Cash / Card on Delivery'
      : 'Pay at Collection Counter'

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

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-rule bg-card shadow-2xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-drawer-title"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-card/95 px-6 py-4 backdrop-blur-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 id="payment-drawer-title" className="font-display text-lg font-bold text-body">
                    Bill #{orderNo(bill.billNumber)}
                  </h2>
                  <PaymentStatusBadge status={bill.paymentStatus} />
                </div>
                <span className="text-xs text-body-muted">
                  Billed on {new Date(bill.billDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at {new Date(bill.billDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
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
              {/* Related Order Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-rule bg-canvas-2/50 p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                      Related Order
                    </span>
                    <OrderTypeBadge orderType={order?.orderType} />
                  </div>
                  <span className="font-display text-base font-bold text-body">
                    Order #{orderNo(order?.orderNumber)}
                  </span>
                </div>

                <Link
                  to={`${ROUTES.ORDERS}/${bill.orderId}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition hover:underline"
                >
                  View Order
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-body">Billed Items</h3>
                  <span className="text-xs text-body-muted">
                    {items.reduce((sum, it) => sum + it.quantity, 0)} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-rule/60 rounded-2xl border border-rule bg-card">
                  {items.map((item) => {
                    const imageUrl = getImageUrl(item.menuItem?.imageUrl)
                    return (
                      <div key={item.id} className="flex items-center gap-3.5 p-3.5">
                        <div className="h-10 w-10 flex-none overflow-hidden rounded-xl bg-canvas-2 border border-rule/50">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.menuItem?.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-body-faint">
                              <UtensilsCrossed className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium text-xs text-body truncate">
                            {item.menuItem?.name || 'Dish'}
                          </span>
                          <span className="text-[0.7rem] text-body-muted">
                            {money(item.unitPrice)} × {item.quantity}
                          </span>
                        </div>

                        <span className="font-semibold text-xs text-body">
                          {money(item.subtotal)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                <h3 className="font-display text-sm font-semibold text-body">Financial Breakdown</h3>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-body-muted">
                    <span>Food Subtotal</span>
                    <span>{money(bill.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-body-muted">
                    <span>VAT ({Number(bill.vatPercent)}%)</span>
                    <span>{money(bill.vatAmount)}</span>
                  </div>

                  {Number(bill.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        Discount
                      </span>
                      <span>-{money(bill.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-rule pt-2.5 text-sm font-bold text-body">
                    <span>Grand Total</span>
                    <span className="text-gold-600 dark:text-gold-400">{money(bill.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Settlement & Payment Method */}
              <div className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-4 text-xs">
                <h3 className="font-display text-sm font-semibold text-body mb-1">Payment Method &amp; Settlement</h3>
                <div className="flex justify-between text-body-muted">
                  <span>Method</span>
                  <span className="font-medium text-body flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-body-muted" />
                    {paymentMethodLabel}
                  </span>
                </div>
                <div className="flex justify-between text-body-muted">
                  <span>Status</span>
                  <span
                    className={`font-semibold ${
                      bill.paymentStatus === 'PAID'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {bill.paymentStatus === 'PAID' ? 'Settled & Paid' : 'Awaiting Payment Settlement'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-rule bg-card/95 p-4 backdrop-blur-md">
              <button
                type="button"
                onClick={() => onViewReceipt(bill)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98]"
              >
                <Receipt className="h-4 w-4" />
                View Receipt
              </button>

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

