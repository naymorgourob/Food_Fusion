// Reused by both the Admin reservation list and the Customer's own list —
// one definition of what each status looks like, everywhere it appears.
const STATUS_STYLES = {
  PENDING: 'bg-warning-soft text-warning',
  CONFIRMED: 'bg-info-soft text-info',
  CANCELLED: 'bg-surface-2 text-ink-muted',
  COMPLETED: 'bg-success-soft text-success',
}

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
