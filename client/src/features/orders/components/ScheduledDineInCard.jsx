import { CalendarClock, ChefHat, UtensilsCrossed } from 'lucide-react'
import { getScheduledDineInTimes } from '@/features/orders/constants'

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function Row({ icon: Icon, label, date, highlight }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-ink-muted">
        <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
        {label}
      </span>
      <span className={`text-sm ${highlight ? 'font-semibold text-ink' : 'text-ink'}`}>{formatTime(date)}</span>
    </div>
  )
}

/**
 * Arrival / Preparation Starts / Estimated Ready for a scheduled dine-in
 * (Part 18.1). Renders nothing for any other order, so callers can drop it
 * in unconditionally. Shared by the customer's tracking page and the
 * Admin/Staff order modal — same three numbers, one definition.
 */
export function ScheduledDineInCard({ order }) {
  const times = getScheduledDineInTimes(order)
  if (!times) return null

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Scheduled Dine-In</span>
      <Row icon={CalendarClock} label="Arrival Time" date={times.arrival} highlight />
      <Row icon={ChefHat} label="Preparation Starts At" date={times.prepStartsAt} />
      <Row icon={UtensilsCrossed} label="Estimated Ready Time" date={times.readyAt} />
      <p className="text-xs text-ink-faint">
        {times.arrival.toLocaleDateString()} · {order.guestCount} guest(s)
      </p>
    </div>
  )
}
