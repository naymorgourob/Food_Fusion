import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserRound, Phone, CalendarDays, Clock, Users, Armchair, Sparkles, ScrollText, History, Receipt } from 'lucide-react'
import { StatusBadge } from '@/features/reservations/components/StatusBadge'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { orderNo, money } from '@/utils/format'
import { getImageUrl } from '@/constants'

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

function Row({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">{label}</span>
        <span className="text-sm break-words text-body">{children}</span>
      </div>
    </div>
  )
}

/**
 * Full reservation detail + status update, as a slide-in drawer
 * (UI-08.5) — supersedes ReservationDetailsModal.jsx, following the same
 * pattern as AdminOrderDrawer (UI-08.4) and StaffOrderDrawer (UI-07):
 * a fresh component rather than restyling Modal.jsx, which every other
 * Add/Edit form in the Admin Dashboard still uses.
 *
 * Status change is the exact same handler ReservationDetailsModal
 * called (PUT /reservations/:id). There is no Create or Edit form here:
 * POST /reservations is authorizeCustomer-only, and
 * updateReservationStatus is the only field Admin can change — see the
 * design note on ReservationsPage.jsx for what that means for this
 * module's scope.
 *
 * "Reservation Timeline" was requested but Reservation has no per-status
 * timestamps (no confirmedAt/completedAt, unlike Order's "...At"
 * columns) — only createdAt/updatedAt. Rather than fabricate a
 * Pending→Confirmed→Completed sequence with invented dates, this shows
 * the two real facts: when the booking was made, and — only when it
 * genuinely differs — when it was last changed.
 */
export function AdminReservationDrawer({ reservation, isOpen, onClose, onStatusChange, isUpdatingStatus }) {
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!reservation) return null

  const occasion = reservation.occasion
    ? reservation.occasion === 'OTHER'
      ? reservation.occasionNote?.trim() || 'Other'
      : OCCASION_LABELS[reservation.occasion]
    : null

  const wasUpdated = new Date(reservation.updatedAt).getTime() !== new Date(reservation.createdAt).getTime()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close reservation details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Reservation for ${reservation.customerName}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-canvas shadow-2xl"
          >
            <header className="flex flex-none items-center justify-between border-b border-rule px-5 py-4">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-lg font-semibold text-body">
                  {orderNo(reservation.id.slice(-6).toUpperCase())}
                </h2>
                <StatusBadge status={reservation.status} />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close reservation details"
                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-6">
                {/* --- Customer ---------------------------------------- */}
                <section className="grid grid-cols-2 gap-4 rounded-2xl border border-rule bg-card p-4">
                  <Row icon={UserRound} label="Customer">
                    {reservation.customerName}
                  </Row>
                  <Row icon={Phone} label="Phone">
                    {reservation.customerPhone}
                  </Row>
                  <Row icon={CalendarDays} label="Date">
                    {new Date(reservation.reservationDate).toLocaleDateString([], {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Row>
                  <Row icon={Clock} label="Time">
                    {reservation.reservationTime}
                  </Row>
                  <Row icon={Users} label="Guests">
                    {reservation.guestCount}
                  </Row>
                  <Row icon={Armchair} label="Table">
                    Table {reservation.table.number} ({reservation.table.capacity} seats)
                  </Row>
                </section>

                {occasion && (
                  <section className="flex items-center gap-3 rounded-2xl border border-gold-300 bg-gold-100/40 p-4 dark:border-gold-700 dark:bg-gold-100/5">
                    <Sparkles className="h-4 w-4 flex-none text-gold-700 dark:text-gold-300" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold tracking-wide text-gold-700 uppercase dark:text-gold-300">
                        Occasion
                      </span>
                      <span className="text-sm text-body">{occasion}</span>
                    </div>
                  </section>
                )}

                <section className="flex flex-col gap-3 rounded-2xl border border-gold-300 bg-gold-100/40 p-4 dark:border-gold-700 dark:bg-gold-100/5">
                  <span className="text-xs font-semibold tracking-wide text-gold-700 uppercase dark:text-gold-300">Advance payment proof</span>
                  <Row icon={Receipt} label="Advance amount">{money(reservation.advanceAmount ?? 0)}</Row>
                  <Row icon={Receipt} label="Transaction / Reference ID">{reservation.paymentReference}</Row>
                  {reservation.paymentProofImage && (
                    <a href={getImageUrl(`/uploads/payment/${reservation.paymentProofImage}`)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 underline dark:text-brand-400">
                      View uploaded payment screenshot
                    </a>
                  )}
                  {!reservation.paymentReference && !reservation.paymentProofImage && <span className="text-sm text-red-600">No payment proof submitted</span>}
                </section>

                {reservation.specialRequest && (
                  <section className="flex items-start gap-2.5 rounded-2xl border border-rule bg-card p-4">
                    <ScrollText className="mt-0.5 h-4 w-4 flex-none text-body-faint" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium tracking-wide text-body-faint uppercase">
                        Special request
                      </span>
                      <span className="text-sm text-body-muted">{reservation.specialRequest}</span>
                    </div>
                  </section>
                )}

                {/* --- History (real timestamps only) ------------------ */}
                <section className="flex flex-col gap-2.5 rounded-2xl border border-rule bg-card p-4">
                  <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-body-faint uppercase">
                    <History className="h-3.5 w-3.5" />
                    History
                  </span>
                  <Row icon={CalendarDays} label="Booked on">
                    {new Date(reservation.createdAt).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Row>
                  {wasUpdated && (
                    <Row icon={CalendarDays} label="Last updated">
                      {new Date(reservation.updatedAt).toLocaleString([], {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Row>
                  )}
                </section>

                {/* --- Status ------------------------------------------- */}
                <section className="flex flex-col gap-2">
                  <label
                    htmlFor="admin-reservation-status"
                    className="text-xs font-semibold tracking-wide text-body-faint uppercase"
                  >
                    Update status
                  </label>
                  <select
                    id="admin-reservation-status"
                    value={reservation.status}
                    disabled={isUpdatingStatus}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0) + option.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </section>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
