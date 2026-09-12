import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Receipt, UtensilsCrossed } from 'lucide-react'
import { money, orderNo } from '@/utils/format'

export function CustomerReceiptModal({ bill, isOpen, onClose }) {
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
  const customer = order?.customer
  const items = order?.items || []

  function handlePrint() {
    window.print()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs print:hidden"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-rule bg-card p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] print:m-0 print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
          >
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-rule print:hidden">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-semibold text-sm">
                <Receipt className="h-4 w-4" />
                <span>Customer Receipt</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-body-muted hover:bg-canvas-2 hover:text-body transition"
                  aria-label="Close receipt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Content */}
            <div className="flex flex-col gap-6 pt-4 text-xs font-sans">
              {/* Restaurant Branding Header */}
              <div className="flex flex-col items-center text-center gap-1">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-white font-display text-base font-bold shadow-sm">
                  F
                </span>
                <h1 id="receipt-title" className="font-display text-xl font-bold text-body tracking-tight mt-1">
                  FoodFusion
                </h1>
                <p className="text-[0.7rem] text-body-muted uppercase tracking-widest">
                  Fine Dining &amp; Cuisine
                </p>
                <p className="text-[0.7rem] text-body-faint">
                  123 Gourmet Ave, Food City · +1 (555) 123-4567
                </p>
              </div>

              {/* Receipt Metadata */}
              <div className="flex flex-col gap-1.5 border-y border-dashed border-rule py-3 text-body-muted">
                <div className="flex justify-between">
                  <span>Receipt / Bill:</span>
                  <span className="font-semibold text-body">#{orderNo(bill.billNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Related Order:</span>
                  <span className="font-semibold text-body">#{orderNo(order?.orderNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date &amp; Time:</span>
                  <span className="text-body">
                    {new Date(bill.billDate).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {new Date(bill.billDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                {customer?.fullName && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="text-body">{customer.fullName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`font-bold ${
                      bill.paymentStatus === 'PAID'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {bill.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-semibold text-body border-b border-rule/50 pb-1 text-[0.75rem]">
                  <span>Item</span>
                  <span>Amount</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start text-body-muted">
                      <div className="flex flex-col pr-2">
                        <span className="text-body font-medium">{it.menuItem?.name || 'Dish'}</span>
                        <span className="text-[0.65rem] text-body-faint">
                          {money(it.unitPrice)} × {it.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-body">{money(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col gap-1.5 border-t border-dashed border-rule pt-3 text-body-muted">
                <div className="flex justify-between">
                  <span>Food Subtotal</span>
                  <span>{money(bill.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>VAT ({Number(bill.vatPercent)}%)</span>
                  <span>{money(bill.vatAmount)}</span>
                </div>

                {Number(bill.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{money(bill.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-rule pt-2 font-display text-base font-bold text-body">
                  <span>Total Amount</span>
                  <span className="text-gold-600 dark:text-gold-400">{money(bill.grandTotal)}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="flex flex-col items-center text-center gap-1 pt-3 border-t border-dashed border-rule text-body-faint text-[0.7rem]">
                <p>Thank you for dining with us at FoodFusion.</p>
                <p className="italic text-[0.65rem]">We look forward to serving you again soon.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

