import { CheckCircle2, CircleDollarSign, Circle } from 'lucide-react'

/**
 * Payment status badge for Admin Order Management (UI-08.4).
 *
 * Reads straight off order.bill — Bill.paymentStatus is only ever PAID or
 * UNPAID (see BillPaymentStatus in schema.prisma), and a bill doesn't
 * exist at all until staff generate one in Billing. That "no bill yet"
 * case is common (most in-flight orders) and genuinely different from
 * "billed but unpaid," so it gets its own honest label rather than being
 * shown as a blank or lumped in with Unpaid.
 */
export function PaymentStatusBadge({ bill }) {
  if (!bill) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body-faint">
        <Circle className="h-3 w-3" />
        No bill yet
      </span>
    )
  }

  if (bill.paymentStatus === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
        <CheckCircle2 className="h-3 w-3" />
        Paid
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
      <CircleDollarSign className="h-3 w-3" />
      Unpaid
    </span>
  )
}
