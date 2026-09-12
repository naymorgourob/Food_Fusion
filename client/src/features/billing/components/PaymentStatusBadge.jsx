import { PAYMENT_STATUS_CONFIG } from '@/features/billing/billingHelpers'

export function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.UNPAID

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
          status === 'UNPAID' ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  )
}
