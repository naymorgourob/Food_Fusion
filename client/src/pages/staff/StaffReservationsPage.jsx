import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarClock, Users, Sparkles, Armchair, Info } from 'lucide-react'
import { StatusBadge } from '@/features/reservations/components/StatusBadge'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { orderNo } from '@/utils/format'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatTime(value) {
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Staff's reservations view (UI-07) — read-only.
 *
 * PUT /reservations/:id (confirm/change status) and cancelling on a
 * customer's behalf are both authorizeAdmin — Staff can read every
 * booking (GET is role-scoped, not role-gated) but cannot act on one.
 * Confirming a reservation is the restaurant's front-of-house decision in
 * this system, not the kitchen/floor staff's, so rather than show
 * Confirm/Cancel buttons that would 403, this surfaces the same
 * information with a clear note on where a change actually happens.
 */
export default function StaffReservationsPage() {
  const { reservations } = useOutletContext()

  const upcoming = useMemo(() => {
    const today = startOfToday()
    return [...reservations.reservations]
      .filter((row) => new Date(row.reservationDate) >= today && row.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate))
  }, [reservations.reservations])

  const pendingCount = upcoming.filter((row) => row.status === 'PENDING').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Reservations</h1>
        <p className="text-sm text-body-muted">
          {upcoming.length} upcoming{pendingCount > 0 ? ` · ${pendingCount} awaiting confirmation` : ''}
        </p>
      </div>

      <p className="flex items-start gap-2.5 rounded-xl border border-gold-300 bg-gold-100/60 px-4 py-3 text-sm text-charcoal dark:border-gold-700 dark:bg-gold-100/10 dark:text-body">
        <Info className="mt-0.5 h-4 w-4 flex-none text-gold-700 dark:text-gold-300" />
        Confirming or cancelling a reservation is handled by the front desk. This view is for
        checking who&rsquo;s coming in and when.
      </p>

      {reservations.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No upcoming reservations" description="Bookings will appear here as customers make them." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((reservation) => {
            const occasion = reservation.occasion
              ? reservation.occasion === 'OTHER'
                ? reservation.occasionNote?.trim() || 'Other'
                : OCCASION_LABELS[reservation.occasion]
              : null

            return (
              <article
                key={reservation.id}
                className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-semibold text-body">
                      {reservation.customerName}
                    </span>
                    <span className="text-xs text-body-faint">
                      {orderNo(reservation.id.slice(-6).toUpperCase())}
                    </span>
                  </div>
                  <StatusBadge status={reservation.status} />
                </div>

                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center gap-2 text-body-muted">
                    <CalendarClock className="h-3.5 w-3.5 flex-none text-brand-700 dark:text-brand-400" />
                    {new Date(reservation.reservationDate).toLocaleDateString([], {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {formatTime(reservation.reservationTime)}
                  </span>
                  <span className="flex items-center gap-2 text-body-muted">
                    <Users className="h-3.5 w-3.5 flex-none text-brand-700 dark:text-brand-400" />
                    {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
                  </span>
                  <span className="flex items-center gap-2 text-body-muted">
                    <Armchair className="h-3.5 w-3.5 flex-none text-brand-700 dark:text-brand-400" />
                    Table {reservation.table.number}
                  </span>
                  {occasion && (
                    <span className="flex items-center gap-2 text-body-muted">
                      <Sparkles className="h-3.5 w-3.5 flex-none text-gold-500" />
                      {occasion}
                    </span>
                  )}
                </div>

                {reservation.specialRequest && (
                  <p className="rounded-lg bg-canvas-2 px-3 py-2 text-xs leading-relaxed text-body-muted">
                    {reservation.specialRequest}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
