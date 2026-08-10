import { motion } from 'framer-motion'
import { Check, Receipt } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import { STATUS_ICONS, TIMESTAMP_FIELD } from '@/features/orders/trackingStatus'

/**
 * Order timeline for Admin/Staff order management (UI-08.4) — a fresh,
 * emerald-styled component, not a restyle of the old OrderTimeline.jsx
 * (which stayed on the ink/surface tokens and is only ever used by the
 * OrderDetailsModal this task replaces; both are deleted once nothing
 * references them — see the note on OrdersPage.jsx).
 *
 * Reuses FLOW_BY_TYPE/TIMESTAMP_FIELD/STATUS_ICONS from
 * trackingStatus.js — the exact same vocabulary the customer's own
 * tracking page (UI-05) already uses, so Admin and a customer looking at
 * the same order see an identical sequence of stages, never two
 * different ideas of "what happens after Preparing" for the same order
 * type.
 *
 * "Payment Completed" was requested as its own timeline stage. There is
 * no separate payment-event timestamp — Bill.billDate is the closest real
 * fact (when the invoice was generated, which for a paid bill means when
 * it was settled) — so it's spliced in using that real date only once a
 * bill genuinely exists, rather than always showing a "Payment Completed"
 * row that would be blank or misleading for the many orders billing
 * hasn't been generated for yet.
 */
export function AdminOrderTimeline({ order }) {
  const flow = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY']
  if (order.orderType === 'DELIVERY') flow.push('ON_THE_WAY')
  else flow.push('SERVED')
  flow.push('COMPLETED')

  const cancelled = order.status === 'CANCELLED'

  const entries = flow.map((status) => ({
    status,
    timestamp: order[TIMESTAMP_FIELD[status]] ?? null,
  }))

  // Payment is spliced in right after Placed, since a bill can in
  // principle be generated any time after the order exists — but only
  // when one genuinely has been, using Bill.billDate as the real
  // timestamp.
  if (order.bill) {
    entries.splice(1, 0, {
      status: 'BILLED',
      label: order.bill.paymentStatus === 'PAID' ? 'Payment completed' : 'Invoice generated',
      timestamp: order.bill.billDate,
      icon: Receipt,
    })
  }

  if (cancelled) {
    entries.push({ status: 'CANCELLED', timestamp: order.cancelledAt })
  }

  const currentIndex = cancelled ? -1 : entries.findIndex((entry) => !entry.timestamp)

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const done = Boolean(entry.timestamp)
        const current = index === currentIndex
        const isCancelledRow = entry.status === 'CANCELLED'
        const last = index === entries.length - 1
        const Icon = entry.icon ?? STATUS_ICONS[entry.status] ?? Check
        const label = entry.label ?? ORDER_STATUS_LABELS[entry.status]

        return (
          <li key={entry.status + index} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span aria-hidden className="absolute top-8 bottom-0 left-[0.9rem] w-0.5 bg-rule">
                {done && (
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ originY: 0 }}
                    className={`block h-full w-full ${isCancelledRow ? 'bg-red-400' : 'bg-brand-600'}`}
                  />
                )}
              </span>
            )}

            <span className="relative flex-none">
              {current && (
                <motion.span
                  aria-hidden
                  animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-gold-400"
                />
              )}
              <span
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  isCancelledRow
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                    : done
                      ? 'bg-brand-700 text-white'
                      : current
                        ? 'bg-gold-500 text-charcoal ring-4 ring-gold-500/25'
                        : 'bg-canvas-2 text-body-faint'
                }`}
              >
                {done && !isCancelledRow ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
              </span>
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
              <span
                className={`text-sm font-semibold ${
                  isCancelledRow ? 'text-red-600 dark:text-red-300' : done || current ? 'text-body' : 'text-body-faint'
                }`}
              >
                {label}
              </span>
              <span className="text-xs text-body-faint">
                {entry.timestamp
                  ? new Date(entry.timestamp).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : current
                    ? 'In progress'
                    : 'Not yet'}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
