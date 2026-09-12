import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Receipt,
  User,
  Mail,
  Phone,
  Calendar,
  Utensils,
  CheckCircle2,
  RotateCcw,
  Printer,
  Copy,
  Check,
} from 'lucide-react'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { money, orderNo } from '@/utils/format'

export function AdminBillDrawer({
  bill,
  isOpen,
  onClose,
  onStatusChange,
  isUpdatingStatus,
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!bill) return null

  const customer = bill.order?.customer
  const order = bill.order
  const items = order?.items ?? []

  function handleCopyInvoiceNumber() {
    navigator.clipboard?.writeText(orderNo(bill.billNumber))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close invoice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Invoice #${bill.billNumber}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-canvas shadow-2xl"
          >
            {/* Header */}
            <header className="flex flex-none items-center justify-between border-b border-rule px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
                  <Receipt className="h-5 w-5" />
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-body truncate">
                      Invoice {orderNo(bill.billNumber)}
                    </h2>
                    <button
                      type="button"
                      onClick={handleCopyInvoiceNumber}
                      title="Copy invoice number"
                      className="text-body-faint hover:text-body"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-body-faint">
                    Issued {new Date(bill.billDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  aria-label="Print invoice"
                  title="Print invoice"
                  className="rounded-lg p-2 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="rounded-lg p-2 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Invoice Document Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between rounded-2xl border border-rule bg-card p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-body-muted">Payment Settlement</span>
                    <span className="text-[11px] text-body-faint">
                      {bill.paymentStatus === 'PAID'
                        ? 'This transaction is completely paid and settled.'
                        : 'Awaiting customer or staff payment settlement.'}
                    </span>
                  </div>
                  <PaymentStatusBadge status={bill.paymentStatus} />
                </div>

                {/* Customer & Order Details Card */}
                <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                    Customer & Dining Details
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-body-muted flex items-center gap-1">
                        <User className="h-3 w-3" /> Customer Name
                      </span>
                      <strong className="text-body font-semibold">
                        {customer?.fullName || 'Guest Customer'}
                      </strong>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-body-muted flex items-center gap-1">
                        <Utensils className="h-3 w-3" /> Dining Order
                      </span>
                      <strong className="text-body font-semibold">
                        {order?.orderNumber ? orderNo(order.orderNumber) : '—'} ({order?.orderType || 'Dine-In'})
                      </strong>
                    </div>

                    {customer?.email && (
                      <div className="flex flex-col gap-1">
                        <span className="text-body-muted flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email Address
                        </span>
                        <span className="text-body truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer?.phone && (
                      <div className="flex flex-col gap-1">
                        <span className="text-body-muted flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </span>
                        <span className="text-body">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Order Line Items */}
                <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                    Itemized Order Lines
                  </span>

                  {items.length === 0 ? (
                    <div className="py-4 text-center text-xs text-body-muted">
                      Standard order total ({money(bill.subtotal)})
                    </div>
                  ) : (
                    <div className="divide-y divide-rule text-xs">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2.5"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-semibold text-body truncate">
                              {item.menuItem?.name || 'Menu Item'}
                            </span>
                            <span className="text-[11px] text-body-faint">
                              {item.quantity} × {money(item.unitPrice)}
                            </span>
                          </div>
                          <span className="font-semibold text-body flex-none">
                            {money(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Summary Card */}
                <div className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-4 text-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-body-faint pb-1 border-b border-rule">
                    Financial Totals
                  </span>

                  <div className="flex justify-between text-body-muted pt-1">
                    <span>Subtotal</span>
                    <span className="font-semibold text-body">{money(bill.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-body-muted">
                    <span>VAT ({Number(bill.vatPercent)}%)</span>
                    <span className="font-semibold text-body">{money(bill.vatAmount)}</span>
                  </div>

                  {Number(bill.discount) > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Discount Applied</span>
                      <span>-{money(bill.discount)}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-rule pt-3">
                    <span className="font-display text-sm font-bold text-body">Grand Total</span>
                    <span className="font-display text-lg font-bold text-body">
                      {money(bill.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <footer className="flex flex-none items-center justify-between border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <span className="text-xs text-body-faint">
                Status:{' '}
                <strong className={bill.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>
                  {bill.paymentStatus}
                </strong>
              </span>

              <button
                type="button"
                onClick={() =>
                  onStatusChange(bill.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID')
                }
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-xs transition-all hover:-translate-y-0.5 disabled:opacity-60 ${
                  bill.paymentStatus === 'UNPAID'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-rule bg-card text-body hover:bg-canvas-2'
                }`}
              >
                {bill.paymentStatus === 'UNPAID' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isUpdatingStatus ? 'Updating…' : 'Mark as Paid'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>{isUpdatingStatus ? 'Updating…' : 'Mark as Unpaid'}</span>
                  </>
                )}
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

