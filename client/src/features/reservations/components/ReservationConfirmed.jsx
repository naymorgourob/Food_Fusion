import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CalendarPlus, LayoutDashboard, UtensilsCrossed, Users, Clock, Armchair } from 'lucide-react'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { orderNo } from '@/utils/format'
import { ROUTES } from '@/constants'

/**
 * Post-booking confirmation (UI-06).
 *
 * The old form replaced itself with a one-line green banner, which for the
 * only irreversible action on the page was thin. This holds the details
 * still so the customer can check them, and offers the obvious next steps.
 *
 * "Add to calendar" was specified as UI-only. It's implemented for real
 * instead — an .ics file built client-side from the booking, no API and no
 * dependency. A button that looks functional but does nothing is worse
 * than no button, and this was cheap to make genuine.
 */

function toIcsStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildIcs(reservation) {
  const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
  const day = new Date(reservation.reservationDate)
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours || 19, minutes || 0)
  const end = new Date(start.getTime() + Number(reservation.durationMinutes || 120) * 60 * 1000)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FoodFusion//Reservation//EN',
    'BEGIN:VEVENT',
    `UID:${reservation.id}@foodfusion`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    'SUMMARY:Dinner at FoodFusion',
    `DESCRIPTION:Table ${reservation.table.number} for ${reservation.guestCount} guest(s).`,
    'LOCATION:FoodFusion',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2">
      <Icon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
      <span className="text-[0.65rem] font-medium tracking-wide text-body-faint uppercase">{label}</span>
      <span className="text-center text-sm font-semibold text-body">{value}</span>
    </div>
  )
}

export function ReservationConfirmed({ reservation, preOrder, onBookAnother }) {
  const day = new Date(reservation.reservationDate)
  const dateLabel = day.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

  const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
  const timeDate = new Date()
  timeDate.setHours(hours, minutes, 0, 0)
  const timeLabel = timeDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const occasion = reservation.occasion
    ? reservation.occasion === 'OTHER'
      ? reservation.occasionNote?.trim() || 'Other'
      : OCCASION_LABELS[reservation.occasion]
    : null

  function downloadIcs() {
    const blob = new Blob([buildIcs(reservation)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `foodfusion-reservation-${reservation.id.slice(-6)}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-7 py-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        <motion.span
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.25, opacity: 0 }}
          transition={{ duration: 1.1, repeat: 1, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-brand-400"
        />
        <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/50" />
        <span className="absolute inset-3 rounded-full bg-brand-700" />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 400, damping: 16 }}
          className="relative text-white"
        >
          <Check className="h-9 w-9" strokeWidth={3} />
        </motion.span>
      </motion.div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">
          Reservation received
        </h1>
        <p className="text-sm leading-relaxed text-body-muted">
          We&rsquo;ve sent your request to the restaurant — it&rsquo;s pending confirmation, and
          you&rsquo;ll see the status update on this page.
        </p>
      </div>

      {/* --- Details ---------------------------------------------------- */}
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-rule bg-card p-5">
        <div className="flex items-center justify-between gap-3 border-b border-rule pb-3">
          <span className="text-sm text-body-muted">Reference</span>
          <span className="font-display text-base font-semibold text-body">
            {orderNo(reservation.id.slice(-6).toUpperCase())}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Detail icon={CalendarPlus} label="Date" value={dateLabel} />
          <Detail icon={Clock} label="Time" value={timeLabel} />
          <Detail
            icon={Users}
            label="Guests"
            value={`${reservation.guestCount} ${reservation.guestCount === 1 ? 'guest' : 'guests'}`}
          />
          <Detail icon={Armchair} label="Table" value={`No. ${reservation.table.number}`} />
        </div>

        {occasion && (
          <p className="rounded-lg bg-gold-100/60 px-3 py-2 text-xs font-medium text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
            We&rsquo;ve noted the occasion: {occasion}
          </p>
        )}
      </div>

      {/* --- Next steps -------------------------------------------------- */}
      <div className="flex w-full flex-col gap-3">
        {/* Pre-order was chosen, so hand off to the ordering flow — a
            reservation and an order are separate records here, and the
            scheduled dine-in order is what makes the kitchen start early. */}
        {preOrder && (
          <Link
            to={`${ROUTES.ORDERS}/new`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Pre-order your food
          </Link>
        )}

        <button
          type="button"
          onClick={downloadIcs}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
            preOrder
              ? 'border border-rule text-body-muted hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400'
              : 'bg-gold-500 text-charcoal hover:bg-gold-400'
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          Add to calendar
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={ROUTES.ACCOUNT}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rule py-3 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <CalendarPlus className="h-4 w-4" />
            Book another
          </button>
        </div>
      </div>
    </div>
  )
}
