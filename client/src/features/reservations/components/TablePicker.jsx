import { motion } from 'framer-motion'
import { Users, Check, Armchair, Sparkles } from 'lucide-react'
import { money } from '@/utils/format'

/**
 * Table selection (UI-06).
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

export function TablePicker({ tables, selectedId, onSelect, guestCount, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-2xl" aria-hidden />
        ))}
        <span className="sr-only">Loading tables…</span>
      </div>
    )
  }

  const guests = Number(guestCount) || 0

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Choose a table</legend>

      <div role="radiogroup" aria-label="Available tables" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tables.map((table) => {
          // Mirrors the server's guards exactly, so a table is never
          // offered that the API would then reject.
          const tooSmall = guests > 0 && guests > table.capacity
          const unavailable = table.status === 'OCCUPIED' || table.status === 'RESERVED'
          const disabled = tooSmall || unavailable
          const active = selectedId === table.id
          const badge = capacityBadge(table.capacity)

          return (
            <motion.button
              key={table.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              whileHover={disabled ? undefined : { y: -3 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              onClick={() => onSelect(table.id)}
              aria-label={`Table ${table.number}, seats ${table.capacity}${
                tooSmall ? `, too small for ${guests} guests` : unavailable ? ', currently unavailable' : ''
              }`}
              className={`relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                active
                  ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-400 dark:bg-brand-900/30 dark:ring-brand-900'
                  : 'border-rule bg-card hover:border-brand-200'
              }`}
            >
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
              <span className="text-xs text-body-muted">
                Cost {money(table.reservationCost)} · Advance {money(Number(table.reservationCost ?? 0) * 0.2)}
              </span>

              {badge && !disabled && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[0.65rem] font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
                  <badge.icon className="h-3 w-3" />
                  {badge.label}
                </span>
              )}

              {/* The restaurant's own words about this table, when set. */}
              {table.description && !disabled && (
                <span className="line-clamp-1 text-[0.7rem] text-body-faint">{table.description}</span>
              )}

              {tooSmall && (
                <span className="text-[0.7rem] font-medium text-red-600 dark:text-red-300">
                  Too small for {guests}
                </span>
              )}
              {unavailable && !tooSmall && (
                <span className="text-[0.7rem] font-medium text-body-faint">
                  {table.status === 'OCCUPIED' ? 'Occupied' : 'Reserved'}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {tables.length === 0 && (
        <p className="rounded-xl border border-dashed border-rule px-4 py-6 text-center text-sm text-body-muted">
          No tables are currently bookable. Please call us and we&rsquo;ll find you a seat.
        </p>
      )}
    </fieldset>
  )
}
