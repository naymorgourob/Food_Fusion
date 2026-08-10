import { motion } from 'framer-motion'
import { CalendarDays, Clock, Users, Armchair, Sparkles, Phone, X, MessageSquare } from 'lucide-react'
import { StatusBadge } from '@/features/reservations/components/StatusBadge'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { orderNo } from '@/utils/format'

/**
 * One booking, as a card (UI-06).
 *
 * Replaces a DataTable row. A reservation is a small set of facts a
 * customer re-reads ("which day was that again?"), not a dataset to scan
 * and sort, so a card puts the date and time at the top instead of
 * hiding them in the third and fourth columns.
 *
 * Cancel is real: customers may withdraw their own PENDING or CONFIRMED
 * bookings (see cancelReservation in reservation.service.js). Modifying
 * one is not — there is no customer-facing update endpoint, and status
 * changes are the restaurant's decision — so the card offers a phone call
 * rather than a button that would fail.
 */

// Mirrors the server's CANCELLABLE_STATUSES exactly, so the button only
// appears when the API would actually accept the request.
const CANCELLABLE = new Set(['PENDING', 'CONFIRMED'])

function formatDate(value) {
  const date = new Date(value)
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return null
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function isPast(reservation) {
  const date = new Date(reservation.reservationDate)
  const today = new Date()
  return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function ReservationCard({ reservation, onCancel, isCancelling }) {
  const occasion = reservation.occasion
    ? reservation.occasion === 'OTHER'
      ? reservation.occasionNote?.trim() || 'Other'
      : OCCASION_LABELS[reservation.occasion]
    : null

  const canCancel = CANCELLABLE.has(reservation.status) && !isPast(reservation)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-semibold text-body">
            {formatDate(reservation.reservationDate)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-body-muted">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(reservation.reservationTime) ?? reservation.reservationTime}
          </span>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2.5 border-t border-rule pt-4 text-sm">
        <div className="flex items-center gap-2">
          <Armchair className="h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
          <dt className="sr-only">Table</dt>
          <dd className="text-body">Table {reservation.table.number}</dd>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
          <dt className="sr-only">Guests</dt>
          <dd className="text-body">
            {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
          </dd>
        </div>

        {occasion && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 flex-none text-gold-500" />
            <dt className="sr-only">Occasion</dt>
            <dd className="text-body">{occasion}</dd>
          </div>
        )}

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 flex-none text-body-faint" />
          <dt className="sr-only">Reference</dt>
          <dd className="text-body-faint">{orderNo(reservation.id.slice(-6).toUpperCase())}</dd>
        </div>
      </dl>

      {reservation.specialRequest && (
        <div className="flex items-start gap-2.5 rounded-xl bg-canvas-2 px-3.5 py-3">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-none text-body-faint" />
          <span className="text-xs leading-relaxed text-body-muted">{reservation.specialRequest}</span>
        </div>
      )}

      {canCancel && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-rule pt-4">
          {/* No customer-facing update endpoint exists, so changing a
              booking goes through the restaurant rather than a button
              that would 403. */}
          <a
            href="tel:+8801700000000"
            className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Phone className="h-3.5 w-3.5" />
            Call to change
          </a>

          <button
            type="button"
            onClick={() => onCancel(reservation)}
            disabled={isCancelling}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      )}
    </motion.article>
  )
}
