import { CalendarDays, Clock, Users, Sparkles, Armchair, UtensilsCrossed } from 'lucide-react'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { money } from '@/utils/format'

/**
 * Sticky booking summary (UI-06).
 *
 * Fills in as the customer moves through the form, so the commitment they
 * are about to make is always visible rather than scrolled off above.
 * Rows stay muted with an em-dash until a value exists, which doubles as a
 * checklist of what is still outstanding.
 */

function formatDate(value) {
  if (!value) return null
  // Parsed as local midnight, not UTC: `new Date('2026-12-24')` is UTC and
  // renders as the 23rd for anyone behind GMT.
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(value) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatEndTime(value, durationMinutes) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes + Number(durationMinutes || 120), 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function durationLabel(value) {
  const minutes = Number(value)
  if (minutes < 60) return `${minutes} minutes`
  return `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">{label}</span>
        <span className={`text-sm ${value ? 'text-body' : 'text-body-faint'}`}>{value ?? '—'}</span>
      </div>
    </div>
  )
}

export function ReservationSummary({ form, table, preOrder, className = '' }) {
  const occasion = form.occasion
    ? form.occasion === 'OTHER'
      ? form.occasionNote?.trim() || 'Other'
      : OCCASION_LABELS[form.occasion]
    : null

  return (
    <aside
      aria-labelledby="reservation-summary-heading"
      className={`flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 ${className}`}
    >
      <h2
        id="reservation-summary-heading"
        className="font-display text-base font-semibold text-body"
      >
        Your table
      </h2>

      <div className="flex flex-col gap-3.5">
        <Row icon={CalendarDays} label="Date" value={formatDate(form.reservationDate)} />
        <Row
          icon={Clock}
          label="Reserved time"
          value={form.reservationTime ? `${formatTime(form.reservationTime)}–${formatEndTime(form.reservationTime, form.durationMinutes)}` : null}
        />
        <Row icon={Clock} label="Duration" value={form.durationMinutes ? durationLabel(form.durationMinutes) : null} />
        <Row
          icon={Users}
          label="Guests"
          value={form.guestCount ? `${form.guestCount} ${Number(form.guestCount) === 1 ? 'guest' : 'guests'}` : null}
        />
        <Row icon={Sparkles} label="Occasion" value={occasion} />
        <Row
          icon={Armchair}
          label="Table"
          value={table ? `Table ${table.number} · ${table.windowSidePosition}` : null}
        />
        <Row
          icon={Armchair}
          label="Reservation cost"
          value={table ? money(Number(table.reservationCost ?? 0) * (Number(form.durationMinutes || 120) / 120)) : null}
        />
        <Row
          icon={Sparkles}
          label="20% advance"
          value={table ? money(Number(table.reservationCost ?? 0) * (Number(form.durationMinutes || 120) / 120) * 0.2) : null}
        />
        <Row
          icon={UtensilsCrossed}
          label="Dining"
          value={preOrder ? 'Reserve + pre-order food' : 'Reserve table only'}
        />
      </div>

      <p className="rounded-lg bg-canvas-2 px-3 py-2.5 text-xs leading-relaxed text-body-faint">
        Bookings arrive as <strong className="font-semibold text-body-muted">pending</strong> — the
        restaurant confirms shortly after.
      </p>
    </aside>
  )
}
