import { CheckCircle2, Hourglass } from 'lucide-react'
import { PAYMENT_METHOD_LABELS } from '@/features/payments/constants'

// "Payment under review" until Admin approves the advance, then "Payment
// approved". Nothing for orders/bookings without an advance.
export function AdvanceStatusChip({ record, className = '' }) {
  if (!record || Number(record.advanceAmount) <= 0 || record.status === 'CANCELLED') return null
  const method = PAYMENT_METHOD_LABELS[record.paymentMethod]

  return record.advancePaid ? (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300 ${className}`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Payment approved{method ? ` · ${method}` : ''}
    </span>
  ) : (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/25 dark:text-amber-300 ${className}`}
    >
      <Hourglass className="h-3.5 w-3.5" />
      Payment under review{method ? ` · ${method}` : ''}
    </span>
  )
}
