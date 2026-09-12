import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Pencil,
  Trash2,
  Users,
  CalendarDays,
  Clock,
  Phone,
  UserRound,
  Armchair,
  ScrollText,
  Hash,
} from 'lucide-react'
import { TableStatusBadge } from '@/features/tables/components/TableStatusBadge'

/**
 * Full table detail + linked reservations, as a slide-in drawer (UI-08.6).
 *
 * Follows the same pattern as AdminReservationDrawer and AdminOrderDrawer.
 * Shows all real fields from the Table model (number, capacity, status,
 * description) plus today's and upcoming reservations for this table
 * (sourced from the reservations list already fetched by the page — no
 * extra API call).
 */

function formatTime(value) {
  if (!value) return ''
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function DetailRow({ icon: Icon, label, children }) {
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

function ReservationMiniCard({ reservation }) {
  const STATUS_STYLES = {
    PENDING: 'bg-warning-soft text-warning',
    CONFIRMED: 'bg-info-soft text-info',
    CANCELLED: 'bg-surface-2 text-ink-muted',
    COMPLETED: 'bg-success-soft text-success',
  }
  const STATUS_LABELS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  }

  const reservationDate = new Date(reservation.reservationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  reservationDate.setHours(0, 0, 0, 0)

  const isToday = reservationDate.getTime() === today.getTime()

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-rule bg-canvas-2 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-body">
            <UserRound className="h-3.5 w-3.5 text-body-faint" />
            {reservation.customerName}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-body-faint">
            <Phone className="h-3 w-3" />
            {reservation.customerPhone}
          </span>
        </div>
        <span className={`flex-none rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${STATUS_STYLES[reservation.status]}`}>
          {STATUS_LABELS[reservation.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-body-faint uppercase tracking-wide text-[0.6rem]">Date</span>
          <span className="font-semibold text-body">
            {isToday
              ? 'Today'
              : reservationDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-body-faint uppercase tracking-wide text-[0.6rem]">Time</span>
          <span className="font-semibold text-body">{formatTime(reservation.reservationTime)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-body-faint uppercase tracking-wide text-[0.6rem]">Guests</span>
          <span className="font-semibold text-body">{reservation.guestCount}</span>
        </div>
      </div>

      {reservation.specialRequest && (
        <div className="flex items-start gap-1.5 rounded-lg border border-rule bg-card px-2.5 py-2">
          <ScrollText className="mt-0.5 h-3 w-3 flex-none text-body-faint" />
          <span className="text-[0.7rem] text-body-muted italic">{reservation.specialRequest}</span>
        </div>
      )}
    </div>
  )
}

export function AdminTableDrawer({ table, linkedReservations, isOpen, onClose, onEdit, onDelete }) {
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

  if (!table) return null

  // Split linked reservations: today and upcoming (non-cancelled/completed)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeReservations = (linkedReservations ?? [])
    .filter((r) => r.status !== 'CANCELLED' && r.status !== 'COMPLETED')
    .sort((a, b) => {
      const da = new Date(a.reservationDate)
      const db = new Date(b.reservationDate)
      if (da.getTime() !== db.getTime()) return da - db
      return a.reservationTime.localeCompare(b.reservationTime)
    })

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close table details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Table ${table.number} details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-canvas shadow-2xl"
          >
            {/* Header */}
            <header className="flex flex-none items-center justify-between border-b border-rule px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/40 dark:to-canvas-2">
                  <Armchair className="h-5 w-5 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-display text-lg font-bold text-body leading-tight">
                    Table {table.number}
                  </h2>
                  <TableStatusBadge status={table.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close table details"
                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-6">
                {/* --- Core details --- */}
                <section className="grid grid-cols-2 gap-4 rounded-2xl border border-rule bg-card p-4">
                  <DetailRow icon={Hash} label="Table Number">
                    Table {table.number}
                  </DetailRow>
                  <DetailRow icon={Users} label="Capacity">
                    {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                  </DetailRow>
                  {table.description && (
                    <div className="col-span-2">
                      <DetailRow icon={ScrollText} label="Description">
                        {table.description}
                      </DetailRow>
                    </div>
                  )}
                </section>

                {/* --- Linked reservations --- */}
                <section className="flex flex-col gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-body-faint uppercase">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Active Reservations
                    {activeReservations.length > 0 && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.65rem] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                        {activeReservations.length}
                      </span>
                    )}
                  </span>

                  {activeReservations.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-rule bg-card/50 px-4 py-8 text-center">
                      <Clock className="h-8 w-8 text-body-faint" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-body-muted">No active reservations</p>
                      <p className="text-xs text-body-faint">
                        This table has no pending or confirmed reservations.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {activeReservations.map((res) => (
                        <ReservationMiniCard key={res.id} reservation={res} />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* Footer actions */}
            <footer className="flex flex-none items-center gap-3 border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onDelete(table)
                }}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEdit(table)
                }}
                className="ml-auto flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
              >
                <Pencil className="h-4 w-4" />
                Edit table
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
