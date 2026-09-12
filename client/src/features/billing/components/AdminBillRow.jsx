import { motion } from 'framer-motion'
import { Eye, Receipt, User, Utensils, CheckCircle2, RotateCcw } from 'lucide-react'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { money, orderNo } from '@/utils/format'

export function AdminBillRow({
  bill,
  onView,
  onToggleStatus,
  isUpdatingStatus,
}) {
  const customerName = bill.order?.customer?.fullName || 'Guest Customer'
  const customerEmail = bill.order?.customer?.email || ''
  const billNum = orderNo(bill.billNumber)
  const orderNumberStr = bill.order?.orderNumber ? orderNo(bill.order.orderNumber) : '—'
  const orderType = bill.order?.orderType || 'DINE_IN'

  const formattedDate = new Date(bill.billDate).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col gap-3.5 rounded-2xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        bill.paymentStatus === 'UNPAID'
          ? 'border-amber-200/80 bg-amber-50/15 dark:border-amber-900/40'
          : 'border-rule hover:border-brand-200'
      }`}
    >
      {/* Invoice identification & Customer */}
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-canvas border border-rule text-brand-700 dark:text-brand-300">
          <Receipt className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-body tracking-tight">
              {billNum}
            </span>
            <span className="rounded-md border border-rule bg-canvas-2 px-2 py-0.5 text-[11px] font-semibold text-body-muted">
              Order {orderNumberStr}
            </span>
            <PaymentStatusBadge status={bill.paymentStatus} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body-muted">
            <span className="flex items-center gap-1 font-medium text-body">
              <User className="h-3 w-3 text-body-faint" />
              <span className="truncate max-w-[160px] sm:max-w-xs">{customerName}</span>
            </span>
            {customerEmail && (
              <span className="text-body-faint truncate max-w-[180px] hidden sm:inline">
                ({customerEmail})
              </span>
            )}
            <span className="text-body-faint">
              {formattedDate} · {orderType}
            </span>
          </div>
        </div>
      </div>

      {/* Financials & Actions */}
      <div className="flex items-center justify-between gap-5 border-t border-rule pt-3 sm:border-t-0 sm:pt-0">
        {/* Grand Total & VAT preview */}
        <div className="flex flex-col items-end text-right">
          <span className="font-display text-base font-bold text-body">
            {money(bill.grandTotal)}
          </span>
          <span className="text-[11px] text-body-faint">
            Subtotal {money(bill.subtotal)} · VAT {money(bill.vatAmount)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView(bill)}
            aria-label={`View bill #${bill.billNumber}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(bill)}
            disabled={isUpdatingStatus}
            title={bill.paymentStatus === 'PAID' ? 'Mark as Unpaid' : 'Mark as Paid'}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60 ${
              bill.paymentStatus === 'UNPAID'
                ? 'border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                : 'border-rule bg-canvas text-body-muted hover:bg-canvas-2 hover:text-body'
            }`}
          >
            {bill.paymentStatus === 'UNPAID' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Paid</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Mark Unpaid</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

