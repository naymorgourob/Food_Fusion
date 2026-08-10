const STATUS_STYLES = {
  UNPAID: 'bg-warning-soft text-warning',
  PAID: 'bg-success-soft text-success',
}

const STATUS_LABELS = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
}

export function PaymentStatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
