import { ORDER_STATUS_LABELS } from '@/features/orders/constants'

// Reused everywhere an order status appears — Admin/Staff list, Customer's
// own list, the tracking page's timeline. One definition, one place.
const STATUS_STYLES = {
  PENDING: 'bg-warning-soft text-warning',
  ACCEPTED: 'bg-info-soft text-info',
  PREPARING: 'bg-info-soft text-info',
  READY: 'bg-info-soft text-info',
  ON_THE_WAY: 'bg-info-soft text-info',
  SERVED: 'bg-info-soft text-info',
  COMPLETED: 'bg-success-soft text-success',
  CANCELLED: 'bg-surface-2 text-ink-muted',
}

export function OrderStatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
