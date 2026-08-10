import { motion } from 'framer-motion'
import { Eye, Ban, Phone, Users, Armchair, Sparkles } from 'lucide-react'
import { StatusBadge } from '@/features/reservations/components/StatusBadge'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { orderNo } from '@/utils/format'

function formatTime(value) {
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * One reservation, as a row, in Admin Reservation Management (UI-08.5).
 *
 * A row for the same reason Order Management (UI-08.4) uses one instead
 * of an image-first card — a booking has no photo identity, and the
 * fields the spec asks for (ID, customer, phone, guests, date/time,
 * table, status, special requests, actions) read best scanned
 * left-to-right. Every field is a real column — reservation.id.slice(-6)
 * stands in for a reservation "ID" the same way ReservationCard.jsx
 * (UI-06, customer-facing) already displays it, so the same booking
 * shows the same reference to both the customer and Admin.
 */
export function AdminReservationRow({ reservation, onView, onCancel }) {
  const occasion = reservation.occasion
    ? reservation.occasion === 'OTHER'
      ? reservation.occasionNote?.trim() || 'Other'
      : OCCASION_LABELS[reservation.occasion]
    : null

  const cancellable = reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-rule bg-card p-4 transition-shadow hover:shadow-md hover:shadow-brand-900/5"
    >
      <div className="flex min-w-[7.5rem] flex-col">
        <span className="font-display text-sm font-semibold text-body">
          {orderNo(reservation.id.slice(-6).toUpperCase())}
        </span>
        <span className="text-xs text-body-faint">
          {new Date(reservation.reservationDate).toLocaleDateString([], { day: 'numeric', month: 'short' })} ·{' '}
          {formatTime(reservation.reservationTime)}
        </span>
      </div>

      <div className="flex min-w-[9rem] flex-col">
        <span className="truncate text-sm text-body-muted">{reservation.customerName}</span>
        <span className="flex items-center gap-1.5 text-xs text-body-faint">
          <Phone className="h-3 w-3" />
          {reservation.customerPhone}
        </span>
      </div>

      <span className="flex items-center gap-1.5 text-sm text-body-muted">
        <Users className="h-3.5 w-3.5 text-body-faint" />
        {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
      </span>

      <span className="flex items-center gap-1.5 text-sm text-body-muted">
        <Armchair className="h-3.5 w-3.5 text-body-faint" />
        Table {reservation.table.number}
      </span>

      {occasion && (
        <span className="flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
          <Sparkles className="h-3 w-3" />
          {occasion}
        </span>
      )}

      <StatusBadge status={reservation.status} />

      {reservation.specialRequest && (
        <span className="max-w-[10rem] truncate text-xs text-body-faint italic" title={reservation.specialRequest}>
          “{reservation.specialRequest}”
        </span>
      )}

      <div className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => onView(reservation)}
          aria-label={`View reservation for ${reservation.customerName}`}
          className="rounded-lg p-2 text-body-muted transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
        >
          <Eye className="h-4 w-4" />
        </button>
        {cancellable && (
          <button
            type="button"
            onClick={() => onCancel(reservation)}
            aria-label={`Cancel reservation for ${reservation.customerName}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Ban className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
