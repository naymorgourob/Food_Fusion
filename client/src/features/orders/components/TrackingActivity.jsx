import { Bell, Receipt } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import { STATUS_ICONS, TIMESTAMP_FIELD, statusMessage } from '@/features/orders/trackingStatus'
import { orderNo } from '@/utils/format'

/**
 * Notification history for one order (UI-05).
 *
 * Every entry is derived from a timestamp the backend already records —
 * acceptedAt, preparingAt, readyAt and friends — rather than from a
 * notifications table, which doesn't exist. That means the history is
 * always truthful and needs no new API: if a stage has a timestamp, it
 * genuinely happened at that moment.
 *
 * Newest first, because the most recent update is the one being looked
 * for.
 */
export function TrackingActivity({ order }) {
  const entries = Object.entries(TIMESTAMP_FIELD)
    .map(([status, field]) => ({ status, timestamp: order[field] }))
    .filter((entry) => Boolean(entry.timestamp))

  // A generated invoice is a real event too, and the one customers most
  // often go looking for after the fact.
  if (order.bill) {
    entries.push({
      status: 'BILLED',
      timestamp: order.bill.billDate,
      label: order.bill.paymentStatus === 'PAID' ? 'Payment confirmed' : 'Invoice generated',
      detail: `Invoice ${orderNo(order.bill.billNumber)}`,
      icon: Receipt,
    })
  }

  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (entries.length === 0) return null

  return (
    <section
      aria-labelledby="tracking-activity-heading"
      className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5"
    >
      <h2
        id="tracking-activity-heading"
        className="flex items-center gap-2 font-display text-lg font-semibold text-body"
      >
        <Bell className="h-4 w-4 text-brand-700 dark:text-brand-400" />
        Updates
      </h2>

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => {
          const Icon = entry.icon ?? STATUS_ICONS[entry.status] ?? Bell
          const label = entry.label ?? ORDER_STATUS_LABELS[entry.status]
          const detail = entry.detail ?? statusMessage(entry.status, order.orderType)

          return (
            <li key={entry.status} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>

              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-sm font-semibold text-body">{label}</span>
                <span className="text-xs leading-relaxed text-body-muted">{detail}</span>
              </div>

              <time
                dateTime={new Date(entry.timestamp).toISOString()}
                className="flex-none text-xs whitespace-nowrap text-body-faint"
              >
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </time>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
