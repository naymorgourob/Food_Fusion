import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import {
  FLOW_BY_TYPE,
  STATUS_ICONS,
  TIMESTAMP_FIELD,
  statusMessage,
} from '@/features/orders/trackingStatus'

/**
 * Vertical stage timeline (UI-05).
 *
 * Replaces the old flat list, which drew every stage identically and
 * relied on a small coloured dot to say where you were — easy to miss,
 * and invisible to anyone who can't distinguish the colours.
 *
 * Now each stage is one of three visually distinct states, and the
 * current one is additionally marked by a pulsing ring and by
 * aria-current, so the state is never carried by colour alone.
 */
export function TrackingTimeline({ order }) {
  const flow = FLOW_BY_TYPE[order.orderType] ?? FLOW_BY_TYPE.DINE_IN
  const cancelled = order.status === 'CANCELLED'

  const stages = flow.map((status) => ({
    status,
    timestamp: order[TIMESTAMP_FIELD[status]] ?? null,
  }))

  if (cancelled) {
    stages.push({ status: 'CANCELLED', timestamp: order.cancelledAt })
  }

  // "In progress right now" = the first stage without a timestamp. A
  // cancelled order has no in-progress stage — it stopped.
  const currentIndex = cancelled ? -1 : stages.findIndex((stage) => !stage.timestamp)

  return (
    <section aria-labelledby="tracking-timeline-heading" className="flex flex-col gap-4">
      <h2 id="tracking-timeline-heading" className="font-display text-lg font-semibold text-body">
        Order progress
      </h2>

      <ol className="flex flex-col">
        {stages.map((stage, index) => {
          const done = Boolean(stage.timestamp)
          const current = index === currentIndex
          const isCancelledRow = stage.status === 'CANCELLED'
          const last = index === stages.length - 1
          const Icon = STATUS_ICONS[stage.status] ?? Check

          return (
            <li
              key={stage.status}
              aria-current={current ? 'step' : undefined}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/* Connector — grows in for completed segments. */}
              {!last && (
                <span aria-hidden className="absolute top-9 bottom-0 left-[1.125rem] w-0.5 bg-rule">
                  {done && (
                    <motion.span
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      style={{ originY: 0 }}
                      className={`block h-full w-full ${isCancelledRow ? 'bg-red-400' : 'bg-brand-600'}`}
                    />
                  )}
                </span>
              )}

              {/* Marker */}
              <span className="relative flex-none">
                {current && (
                  <motion.span
                    aria-hidden
                    animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-gold-400"
                  />
                )}
                <motion.span
                  initial={done ? { scale: 0.6, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isCancelledRow
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                      : done
                        ? 'bg-brand-700 text-white'
                        : current
                          ? 'bg-gold-500 text-charcoal ring-4 ring-gold-500/25'
                          : 'bg-canvas-2 text-body-faint'
                  }`}
                >
                  {done && !isCancelledRow ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  )}
                </motion.span>
              </span>

              {/* Copy */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
                <span
                  className={`font-display text-sm font-semibold ${
                    isCancelledRow
                      ? 'text-red-600 dark:text-red-300'
                      : done || current
                        ? 'text-body'
                        : 'text-body-faint'
                  }`}
                >
                  {ORDER_STATUS_LABELS[stage.status]}
                </span>

                <span className="text-xs text-body-faint">
                  {stage.timestamp
                    ? new Date(stage.timestamp).toLocaleString([], {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : current
                      ? 'Happening now'
                      : 'Not yet'}
                </span>

                {current && (
                  <p className="mt-1 text-xs leading-relaxed text-body-muted">
                    {statusMessage(stage.status, order.orderType)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
