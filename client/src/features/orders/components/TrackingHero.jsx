import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, UserRound } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import {
  STATUS_ICONS,
  statusMessage,
  progressFor,
  minutesUntil,
  etaFor,
  IS_FINISHED,
} from '@/features/orders/trackingStatus'
import { orderNo } from '@/utils/format'

/**
 * The live status hero (UI-05): current stage, progress ring, remaining
 * time, and a plain-language message.
 *
 * The ring is an SVG stroke-dashoffset animation rather than a spinner —
 * it encodes an actual value (how far through the flow this order is),
 * so it tells the customer something a spinner cannot.
 *
 * The remaining-time display ticks locally every 30s so the countdown
 * keeps moving between the page's 10s data polls, without a network round
 * trip just to decrement a number.
 */

const RING_SIZE = 168
const STROKE = 10
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatRemaining(minutes) {
  if (minutes === null) return null
  if (minutes < 1) return 'Less than a minute'
  if (minutes === 1) return '1 minute left'
  if (minutes < 60) return `${minutes} minutes left`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m left` : `${hours}h left`
}

export function TrackingHero({ order }) {
  // Local tick so the countdown updates between data polls.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceTick((tick) => tick + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const cancelled = order.status === 'CANCELLED'
  const progress = progressFor(order.status, order.orderType)
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock
  const eta = etaFor(order)
  const remaining = minutesUntil(eta)
  const remainingLabel = formatRemaining(remaining)
  const finished = IS_FINISHED.has(order.status)

  const etaClock = eta
    ? new Date(eta).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <section
      aria-labelledby="tracking-hero-heading"
      className={`relative isolate overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8 ${
        cancelled ? 'bg-charcoal shadow-charcoal/20' : 'bg-brand-800 shadow-brand-900/20'
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-24 -right-20 -z-10 h-72 w-72 rounded-full blur-3xl ${
          cancelled ? 'bg-white/5' : 'bg-gold-500/20'
        }`}
      />

      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
        {/* --- Progress ring ------------------------------------------ */}
        <div className="relative flex flex-none items-center justify-center">
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            role="img"
            aria-label={`Order progress: ${progress}% complete`}
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-white/15"
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress / 100) }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={cancelled ? 'text-white/30' : 'text-gold-400'}
            />
          </svg>

          <span className="absolute flex flex-col items-center gap-1">
            <StatusIcon className={`h-7 w-7 ${cancelled ? 'text-white/60' : 'text-gold-300'}`} strokeWidth={1.75} />
            {!cancelled && (
              <>
                <span className="font-display text-3xl leading-none font-semibold">{progress}%</span>
                <span className="text-[0.65rem] tracking-wide text-white/60 uppercase">complete</span>
              </>
            )}
          </span>
        </div>

        {/* --- Copy ---------------------------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 text-center sm:text-left">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase sm:justify-start">
              {!finished && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
                </span>
              )}
              <span className={cancelled ? 'text-white/60' : 'text-gold-300'}>
                {orderNo(order.orderNumber)}
              </span>
            </span>

            <h1
              id="tracking-hero-heading"
              className="font-display text-3xl leading-tight font-semibold sm:text-4xl"
            >
              {ORDER_STATUS_LABELS[order.status]}
            </h1>

            <p className="text-sm leading-relaxed text-white/75">
              {statusMessage(order.status, order.orderType)}
            </p>
          </div>

          {/* Remaining time — only while the order is still in flight. */}
          {!finished && (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
              {remainingLabel ? (
                <span className="flex items-center gap-2 font-display text-xl font-semibold text-gold-300">
                  <Clock className="h-5 w-5" />
                  {remainingLabel}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-white/65">
                  <Clock className="h-4 w-4" />
                  {eta ? 'Any moment now' : 'Time confirmed once accepted'}
                </span>
              )}

              {etaClock && (
                <span className="text-sm text-white/55">
                  {order.orderType === 'DELIVERY' ? 'Arriving around' : 'Ready around'} {etaClock}
                </span>
              )}
            </div>
          )}

          {order.assignedStaff && !finished && (
            <span className="flex items-center justify-center gap-2 text-sm text-white/70 sm:justify-start">
              <UserRound className="h-4 w-4 text-gold-300" />
              {order.assignedStaff.fullName}
              <span className="text-white/45">· {order.assignedStaff.position ?? 'Your server'}</span>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
