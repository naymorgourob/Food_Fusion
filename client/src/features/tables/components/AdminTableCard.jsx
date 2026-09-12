import { motion } from 'framer-motion'
import { Pencil, Trash2, Eye, Users, ChevronRight, CalendarDays } from 'lucide-react'
import { TableStatusBadge } from '@/features/tables/components/TableStatusBadge'
import { TABLE_STATUS_CONFIG } from '@/features/tables/tableHelpers'

/**
 * One table as a visual card (UI-08.6) — replaces the old DataTable row.
 *
 * Visually represents a restaurant table with status colour coding.
 * Each card shows the table number as the primary identity, capacity,
 * current status, and any linked reservation information.
 *
 * The status colour logic matches TABLE_STATUS_CONFIG in tableHelpers.js —
 * the card's border/background shifts so AVAILABLE tables read green,
 * OCCUPIED tables read red, etc., giving admins an instant room-scan overview.
 *
 * Only columns that actually exist on the backend Table model are shown:
 * number, capacity, status, description. Reservation info is sourced from
 * the reservations prop which is a pre-filtered list of today's reservations
 * for this table.
 */
export function AdminTableCard({ table, todayReservation, onView, onEdit, onDelete }) {
  const config = TABLE_STATUS_CONFIG[table.status] ?? TABLE_STATUS_CONFIG.INACTIVE
  const inactive = table.status === 'INACTIVE'

  // Render a seat icon grid showing capacity (up to 8)
  const seatCount = Math.min(table.capacity, 8)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col rounded-2xl border bg-card transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-900/8 ${
        config.cardBorderClass
      } ${inactive ? 'opacity-70' : ''}`}
    >
      {/* Coloured header strip */}
      <div
        className={`flex items-start justify-between gap-3 rounded-t-2xl px-5 py-4 ${config.cardBgClass}`}
      >
        {/* Table number + status */}
        <div className="flex flex-col gap-1">
          <span className="font-display text-2xl font-bold text-body leading-none">
            {table.number}
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-body-faint">
            Table
          </span>
        </div>

        <TableStatusBadge status={table.status} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {/* Seat visual */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-body-faint flex-none" />
            <span className="text-xs font-semibold text-body-muted">
              {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
            </span>
          </div>

          {/* Seat dots visual */}
          <div className="flex flex-wrap gap-1" aria-hidden>
            {Array.from({ length: seatCount }).map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${
                  table.status === 'AVAILABLE'
                    ? 'bg-success/40'
                    : table.status === 'OCCUPIED'
                      ? 'bg-danger/40'
                      : table.status === 'RESERVED'
                        ? 'bg-warning/40'
                        : 'bg-border'
                }`}
              />
            ))}
            {table.capacity > 8 && (
              <span className="text-[0.6rem] font-bold text-body-faint">+{table.capacity - 8}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {table.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-body-muted">{table.description}</p>
        ) : null}

        {/* Today's reservation (if any) */}
        {todayReservation ? (
          <div className="flex flex-col gap-0.5 rounded-xl border border-warning-soft bg-warning-soft/40 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-warning">
              <CalendarDays className="h-3 w-3" />
              Today's reservation
            </span>
            <span className="text-xs font-semibold text-body">{todayReservation.customerName}</span>
            <span className="text-[0.65rem] text-body-faint">
              {todayReservation.guestCount} guests · {todayReservation.reservationTime}
            </span>
          </div>
        ) : null}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-rule px-5 py-3">
        <button
          type="button"
          onClick={() => onView(table)}
          aria-label={`View details for Table ${table.number}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
        >
          <Eye className="h-3.5 w-3.5" />
          View
          <ChevronRight className="h-3 w-3" />
        </button>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(table)}
            aria-label={`Edit Table ${table.number}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(table)}
            aria-label={`Delete Table ${table.number}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
