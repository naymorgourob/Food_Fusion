import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Check, Armchair, Sparkles, Expand, X, MapPin } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { ADVANCE_RATE } from '@/constants/payments'
import { money } from '@/utils/format'

/**
 * Table selection (UI-06).
 *
 * Each table shows a photo of its spot (Table.imageUrl), and "View" opens
 * a large preview so a guest can see where they'd sit before booking.
 *
 * Badges are derived from real columns only. Table stores number,
 * capacity, status and a free-text description — there is no window /
 * VIP / family attribute, so rather than assigning those at random (which
 * would let someone book "Table 3 — Window Seat" and be seated nowhere
 * near a window) the badges describe what capacity genuinely implies, and
 * the table's own description is shown when the restaurant has written one.
 *
 * Availability is likewise real: the backend rejects INACTIVE tables and
 * any booking whose guest count exceeds capacity (see
 * reservation.service.js), so both are disabled here for the same reasons
 * the server would refuse them.
 */

function capacityBadge(capacity) {
  if (capacity <= 2) return { label: 'Intimate', icon: Sparkles }
  if (capacity >= 6) return { label: 'Family table', icon: Users }
  return null
}

// Seeded photos live in the client's public folder (/tables/...); admin
// uploads would be served by the API (/uploads/...).
function tablePhoto(table) {
  const url = table.imageUrl
  if (!url) return null
  return url.startsWith('/uploads') ? getImageUrl(url) : url
}

// Large look at a table before booking it.
function TablePreview({ table, cost, showCost, disabled, reason, onChoose, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Table ${table.number} preview`}
        initial={{ y: 40, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="min-h-0 flex-1 bg-black">
          <img
            src={tablePhoto(table)}
            alt={`Table ${table.number} — ${table.windowSidePosition}`}
            className="mx-auto max-h-[62vh] w-full object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-col gap-1">
            <span className="font-display text-xl font-semibold text-body">
              Table {table.number}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-body-muted">
              <span className="flex items-center gap-1">
                <Armchair className="h-4 w-4" /> Seats {table.capacity}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {table.windowSidePosition}
              </span>
              {showCost && (
                <span>
                  {money(cost)} · Advance {money(cost * ADVANCE_RATE)}
                </span>
              )}
            </span>
            {table.description && (
              <span className="text-sm text-body-faint">{table.description}</span>
            )}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onChoose}
            className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled ? reason : 'Choose this table'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatTime(value) {
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function TablePicker({
  tables,
  selectedId,
  onSelect,
  guestCount,
  durationMinutes = 120,
  isLoading,
  // Checkout books the table with the order, so no table charge applies.
  showCost = true,
}) {
  const [previewId, setPreviewId] = useState(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-64 rounded-2xl" aria-hidden />
        ))}
        <span className="sr-only">Loading tables…</span>
      </div>
    )
  }

  const guests = Number(guestCount) || 0
  const previewTable = tables.find((table) => table.id === previewId)
  const previewBlocked = previewTable
    ? (guests > 0 && guests > previewTable.capacity) ||
      (typeof previewTable.reservationAvailable === 'boolean'
        ? !previewTable.reservationAvailable
        : previewTable.status === 'OCCUPIED' || previewTable.status === 'RESERVED')
    : false

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Choose a table</legend>

      <div
        role="radiogroup"
        aria-label="Available tables"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tables.map((table) => {
          // Mirrors the server's guards exactly, so a table is never
          // offered that the API would then reject.
          const tooSmall = guests > 0 && guests > table.capacity
          const hasAvailabilityResult = typeof table.reservationAvailable === 'boolean'
          const unavailable = hasAvailabilityResult
            ? !table.reservationAvailable
            : table.status === 'OCCUPIED' || table.status === 'RESERVED'
          const disabled = tooSmall || unavailable
          const active = selectedId === table.id
          const badge = capacityBadge(table.capacity)
          const bookingWindow = table.bookingWindow
          const reservationCost =
            Number(table.reservationCost ?? 0) * (Number(durationMinutes) / 120)
          const reservationConflict = table.reservationAvailable === false
          const photo = tablePhoto(table)

          return (
            <div key={table.id} className="relative flex">
              <motion.button
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                whileHover={disabled ? undefined : { y: -3 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                onClick={() => onSelect(table.id)}
                aria-label={`Table ${table.number}, seats ${table.capacity}${
                  tooSmall
                    ? `, too small for ${guests} guests`
                    : reservationConflict && bookingWindow
                      ? `, reserved from ${formatTime(bookingWindow.startTime)} to ${formatTime(bookingWindow.endTime)}`
                      : unavailable
                        ? ', currently unavailable'
                        : ''
                }`}
                className={`group relative flex w-full flex-col items-start gap-1.5 overflow-hidden rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed ${
                  active
                    ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-400 dark:bg-brand-900/30 dark:ring-brand-900'
                    : reservationConflict
                      ? 'border-amber-300 bg-amber-50/60 opacity-80 dark:border-amber-800/60 dark:bg-amber-950/20'
                      : unavailable
                        ? 'border-rule bg-canvas-2 opacity-65'
                        : 'border-rule bg-card hover:border-brand-200'
                }`}
              >
                {photo && (
                  <span className="-mx-4 -mt-4 mb-2 block aspect-[4/3] w-[calc(100%+2rem)] overflow-hidden">
                    <img
                      src={photo}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        disabled ? 'grayscale' : ''
                      }`}
                    />
                  </span>
                )}
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-body">
                    Table {table.number}
                  </span>
                  {active && (
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-700 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </span>

                <span className="flex items-center gap-1.5 text-xs text-body-muted">
                  <Armchair className="h-3.5 w-3.5" />
                  Seats {table.capacity}
                </span>

                <span className="text-xs font-semibold text-body">{table.windowSidePosition}</span>
                {showCost && (
                  <span className="text-xs text-body-muted">
                    Cost {money(reservationCost)} · Advance {money(reservationCost * ADVANCE_RATE)}
                  </span>
                )}

                {badge && !disabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[0.78rem] font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
                    <badge.icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                )}

                {/* The restaurant's own words about this table, when set. */}
                {table.description && !disabled && (
                  <span className="line-clamp-1 text-[0.82rem] text-body-faint">
                    {table.description}
                  </span>
                )}

                {tooSmall && (
                  <span className="text-[0.82rem] font-medium text-red-600 dark:text-red-300">
                    Too small for {guests}
                  </span>
                )}
                {unavailable && !tooSmall && (
                  <span
                    className={`text-[0.82rem] font-semibold ${reservationConflict ? 'text-amber-700 dark:text-amber-300' : 'text-body-faint'}`}
                  >
                    {reservationConflict && bookingWindow
                      ? `Reserved ${formatTime(bookingWindow.startTime)}–${formatTime(bookingWindow.endTime)}`
                      : reservationConflict
                        ? 'Reserved for this time'
                        : table.status === 'OCCUPIED'
                          ? 'Occupied'
                          : 'Reserved'}
                  </span>
                )}
                {!unavailable && bookingWindow && (
                  <span className="text-[0.82rem] text-body-faint">
                    Next booking: {formatTime(bookingWindow.startTime)}–
                    {formatTime(bookingWindow.endTime)}
                  </span>
                )}
              </motion.button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPreviewId(table.id)}
                  aria-label={`See a larger photo of table ${table.number}`}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/75"
                >
                  <Expand className="h-3.5 w-3.5" />
                  View
                </button>
              )}
            </div>
          )
        })}
      </div>

      {tables.length === 0 && (
        <p className="rounded-xl border border-dashed border-rule px-4 py-6 text-center text-sm text-body-muted">
          No tables are currently bookable. Please call us and we&rsquo;ll find you a seat.
        </p>
      )}
      <AnimatePresence>
        {previewTable && (
          <TablePreview
            table={previewTable}
            cost={Number(previewTable.reservationCost ?? 0) * (Number(durationMinutes) / 120)}
            showCost={showCost}
            disabled={previewBlocked}
            reason={
              guests > previewTable.capacity
                ? `Too small for ${guests}`
                : 'Not available at this time'
            }
            onChoose={() => {
              onSelect(previewTable.id)
              setPreviewId(null)
            }}
            onClose={() => setPreviewId(null)}
          />
        )}
      </AnimatePresence>
    </fieldset>
  )
}
