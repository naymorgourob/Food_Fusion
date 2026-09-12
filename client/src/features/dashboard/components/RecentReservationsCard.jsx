import { Link } from 'react-router-dom'
import { CalendarCheck, ChevronRight, Users, Clock } from 'lucide-react'

const RESERVATION_STATUS_CLASSES = {
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40 animate-pulse',
  COMPLETED: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40',
}

export function RecentReservationsCard({ reservations = [], isLoading = false }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rule/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-body">Recent Bookings</h3>
            <span className="text-[11px] text-body-faint">Guest table reservations</span>
          </div>
        </div>
        <Link
          to="/dashboard/reservations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* List */}
      <div className="my-2 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-rule/40 last:border-0">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-3.5 w-28 rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-8 text-center text-xs text-body-muted">
            No reservations on file.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-rule/60">
            {reservations.slice(0, 5).map((res) => {
              const badgeClass =
                RESERVATION_STATUS_CLASSES[res.status] ||
                'bg-canvas-2 text-body-muted border-rule'

              const resDate = new Date(res.reservationDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })

              return (
                <li
                  key={res.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-2 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold text-body max-w-[130px] sm:max-w-[160px]">
                        {res.customerName || 'Guest Diner'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-rule bg-canvas-2 px-1.5 py-0.5 text-[10px] font-semibold text-body-muted">
                        <Users className="h-2.5 w-2.5" />
                        {res.guestCount} {res.guestCount === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-[11px] text-body-muted">
                      <span>{res.table ? `Table ${res.table.number}` : 'Unassigned'}</span>
                      <span>·</span>
                      <span className="font-medium text-body">
                        {resDate} at {res.reservationTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-none">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                    >
                      {res.status}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-rule/60">
        <Link
          to="/dashboard/reservations"
          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline block text-center"
        >
          Manage table reservations schedule →
        </Link>
      </div>
    </div>
  )
}

