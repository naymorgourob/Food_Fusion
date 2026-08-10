import { useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CalendarX } from 'lucide-react'
import { ReservationHero } from '@/features/reservations/components/ReservationHero'
import { ReservationWizard } from '@/features/reservations/components/ReservationWizard'
import { ReservationConfirmed } from '@/features/reservations/components/ReservationConfirmed'
import { ReservationCard } from '@/features/reservations/components/ReservationCard'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import { cancelReservation } from '@/features/reservations/services/reservationService'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { EmptyState, SectionTitle, SkeletonCard } from '@/components/customer/ui'

// A booking counts as "upcoming" from midnight on its date, so today's 8pm
// table doesn't drop into history at lunchtime.
function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * The customer's reservation page (UI-06).
 *
 * Three modes on one route: browse your bookings, book a new table, and
 * the confirmation that follows. Keeping them together means the list is
 * right there after booking, which is where the customer looks next.
 *
 * Data comes from the existing useReservations hook and reservation
 * service. The only behavioural change is that Cancel now works for
 * customers — DELETE /reservations/:id was opened to owners (with the
 * 404-not-403 privacy rule) at your request; status changes remain
 * Admin-only.
 */
export default function MyReservationsPage() {
  const { reservations, isLoading, refetch } = useReservations()

  const [mode, setMode] = useState('list') // 'list' | 'book' | 'confirmed'
  const [confirmed, setConfirmed] = useState(null)
  const [confirmedPreOrder, setConfirmedPreOrder] = useState(false)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const bookingRef = useRef(null)

  const { upcoming, past } = useMemo(() => {
    const today = startOfToday()
    const sorted = [...reservations].sort(
      (a, b) => new Date(a.reservationDate) - new Date(b.reservationDate),
    )
    return {
      upcoming: sorted.filter(
        (row) => new Date(row.reservationDate) >= today && row.status !== 'CANCELLED',
      ),
      // Newest first for history — the most recent visit is the interesting one.
      past: sorted
        .filter((row) => new Date(row.reservationDate) < today || row.status === 'CANCELLED')
        .reverse(),
    }
  }, [reservations])

  function startBooking() {
    setMode('book')
    // Scrolls the form into view on mobile, where the hero fills the screen.
    requestAnimationFrame(() =>
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  function handleCreated(reservation, { preOrder }) {
    setConfirmed(reservation)
    setConfirmedPreOrder(preOrder)
    setMode('confirmed')
    refetch()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      await cancelReservation(cancelTarget.id)
      setCancelTarget(null)
      refetch()
    } catch (error) {
      setCancelError(error.response?.data?.message ?? 'Failed to cancel this reservation.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (mode === 'confirmed' && confirmed) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <ReservationConfirmed
          reservation={confirmed}
          preOrder={confirmedPreOrder}
          onBookAnother={() => {
            setConfirmed(null)
            setMode('book')
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <ReservationHero onStart={startBooking} />

      {mode === 'book' && (
        <div ref={bookingRef} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-body">New reservation</h2>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="text-sm font-semibold text-body-muted transition-colors hover:text-brand-700 dark:hover:text-brand-400"
            >
              Discard
            </button>
          </div>
          <ReservationWizard onCreated={handleCreated} />
        </div>
      )}

      {/* --- Upcoming --------------------------------------------------- */}
      <section>
        <SectionTitle>Upcoming reservations</SectionTitle>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No upcoming reservations"
            description="Book a table and it will appear here, along with its confirmation status."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {upcoming.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={(row) => {
                    setCancelError('')
                    setCancelTarget(row)
                  }}
                  isCancelling={isCancelling && cancelTarget?.id === reservation.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* --- History ---------------------------------------------------- */}
      {past.length > 0 && (
        <section>
          <SectionTitle>Past &amp; cancelled</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.slice(0, 6).map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} onCancel={() => {}} />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel reservation"
        message={
          cancelTarget
            ? `Cancel your table for ${cancelTarget.guestCount} on ${new Date(
                cancelTarget.reservationDate,
              ).toLocaleDateString()}? This cannot be undone.`
            : ''
        }
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep reservation"
        confirmLabel="Cancel reservation"
        confirmingLabel="Cancelling…"
      />
    </div>
  )
}
