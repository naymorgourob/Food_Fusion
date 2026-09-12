import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Receipt,
  Percent,
  Tag,
  AlertCircle,
  CheckCircle2,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import { generateBill } from '@/features/billing/services/billService'
import { money, orderNo } from '@/utils/format'

const DEFAULT_VAT_PERCENT = 13
const VAT_PRESETS = [0, 5, 10, 13, 15]

const EMPTY_FORM = {
  orderId: '',
  vatPercent: String(DEFAULT_VAT_PERCENT),
  discount: '0',
}

export function GenerateBillModal({ isOpen, onClose, eligibleOrders = [], onGenerated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
      setErrors([])
    }
  }, [isOpen])

  // ESC key and backdrop lock
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  const selectedOrder = eligibleOrders.find((order) => order.id === form.orderId)
  const subtotal = selectedOrder ? Number(selectedOrder.totalAmount) : 0
  const vatRate = Number(form.vatPercent || 0)
  const vatAmount = subtotal * (vatRate / 100)
  const discountAmount = Number(form.discount || 0)
  const grandTotal = Math.max(0, subtotal + vatAmount - discountAmount)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    if (!form.orderId) {
      setErrors(['Please select an eligible completed order to bill.'])
      return
    }

    if (discountAmount < 0) {
      setErrors(['Discount cannot be negative.'])
      return
    }

    if (vatRate < 0 || vatRate > 100) {
      setErrors(['VAT rate must be between 0% and 100%.'])
      return
    }

    setIsSubmitting(true)
    try {
      const bill = await generateBill({
        orderId: form.orderId,
        vatPercent: Number(form.vatPercent),
        discount: Number(form.discount),
      })
      onGenerated(bill)
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Failed to generate bill.'
      setErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          {/* Backdrop */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close modal backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-backdrop/70 backdrop-blur-sm cursor-default"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-bill-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full max-w-xl max-h-[90vh] flex-col rounded-t-3xl border border-rule bg-card shadow-2xl sm:rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-rule px-6 py-5 bg-canvas/60">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="generate-bill-title"
                    className="font-display text-lg font-bold text-body tracking-tight"
                  >
                    Generate Guest Invoice
                  </h2>
                  <p className="text-xs text-body-muted">
                    Issue a verified restaurant bill for a completed guest order
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content & Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 flex-none text-rose-500 mt-0.5" />
                  <ul className="space-y-1">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {eligibleOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rule bg-canvas/50 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-canvas-2 text-body-muted mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-body">
                    All completed orders are billed
                  </h3>
                  <p className="mt-1 text-xs text-body-muted max-w-sm mx-auto">
                    There are currently no unbilled completed orders available in the system. Orders must reach 'Completed' status before an invoice can be generated.
                  </p>
                </div>
              ) : (
                <>
                  {/* Order Selector */}
                  <div className="space-y-1.5">
                    <label htmlFor="bill-order-select" className={LABEL}>
                      Completed Order <span className="text-brand-600 dark:text-brand-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="bill-order-select"
                        required
                        value={form.orderId}
                        onChange={updateField('orderId')}
                        className={`${FIELD} cursor-pointer`}
                      >
                        <option value="" disabled>
                          Select an unbilled completed order ({eligibleOrders.length} available)
                        </option>
                        {eligibleOrders.map((ord) => (
                          <option key={ord.id} value={ord.id}>
                            {orderNo(ord.orderNumber)} — {ord.customer?.fullName || 'Guest'} — {money(ord.totalAmount)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Order Summary Pill */}
                  {selectedOrder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl border border-rule bg-canvas-2/60 p-3.5 text-xs text-body space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-body-faint" />
                          <span className="font-semibold text-body">
                            {selectedOrder.customer?.fullName || 'Guest Customer'}
                          </span>
                        </div>
                        <span className="rounded-md border border-rule bg-card px-2 py-0.5 text-[11px] font-semibold text-body-muted">
                          {selectedOrder.orderType?.replace(/_/g, ' ') || 'DINE IN'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-body-muted border-t border-rule/60 pt-2 text-[11px]">
                        <span>Order Total (Items subtotal)</span>
                        <span className="font-mono font-bold text-body">
                          {money(selectedOrder.totalAmount)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Tax & Discount Inputs */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* VAT Rate */}
                    <div className="space-y-1.5">
                      <label htmlFor="bill-vat" className={LABEL}>
                        VAT Tax Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          id="bill-vat"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={form.vatPercent}
                          onChange={updateField('vatPercent')}
                          className={`${FIELD} pl-9`}
                        />
                        <Percent className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-body-faint" />
                      </div>
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-body-faint">
                          Presets:
                        </span>
                        {VAT_PRESETS.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() =>
                              setForm((curr) => ({ ...curr, vatPercent: String(pct) }))
                            }
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                              Number(form.vatPercent) === pct
                                ? 'bg-brand-500 text-white shadow-xs'
                                : 'bg-canvas-2 border border-rule text-body-muted hover:text-body'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="space-y-1.5">
                      <label htmlFor="bill-discount" className={LABEL}>
                        Discount Amount (৳)
                      </label>
                      <div className="relative">
                        <input
                          id="bill-discount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.discount}
                          onChange={updateField('discount')}
                          className={`${FIELD} pl-9`}
                        />
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-body-faint">
                          ৳
                        </span>
                      </div>
                      <span className="block text-[10px] text-body-faint pt-1">
                        Applied directly against the final grand total
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Preview */}
                  {selectedOrder && (
                    <div className="rounded-2xl border border-rule bg-canvas/70 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-body uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                        Live Calculation Preview
                      </div>
                      <div className="space-y-1.5 text-xs text-body-muted border-t border-rule/60 pt-2">
                        <div className="flex justify-between">
                          <span>Items Subtotal</span>
                          <span className="font-mono text-body">{money(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            VAT ({vatRate > 0 ? `${vatRate}%` : '0%'})
                          </span>
                          <span className="font-mono text-body">+{money(vatAmount)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Promotional Discount</span>
                            <span className="font-mono">-{money(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-t border-rule pt-2 text-sm font-bold text-body">
                          <span>Estimated Grand Total</span>
                          <span className="font-mono text-base text-brand-600 dark:text-brand-400">
                            {money(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-rule px-4 py-2.5 text-xs font-semibold text-body hover:bg-canvas-2 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || eligibleOrders.length === 0 || !form.orderId}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Receipt className="h-4 w-4" />
                  {isSubmitting ? 'Generating Invoice…' : 'Generate & Issue Invoice'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
