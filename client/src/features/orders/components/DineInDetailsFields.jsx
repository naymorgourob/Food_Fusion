import { Minus, Plus, Users } from 'lucide-react'
import { FIELD, LABEL, OPTIONAL, NOTE } from '@/features/orders/components/fieldStyles'
import { TablePicker } from '@/features/reservations/components/TablePicker'

// Today's date/time in the browser's local timezone, formatted for a
// datetime-local input's min attribute — same "client-side nicety, server
// re-validates regardless" pattern as CustomerReservationForm's todayIsoDate.
function nowLocalDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16)
}

const MAX_GUESTS = 20

// A − / + stepper rather than a bare number box, so the guest count stands
// out on the dark checkout. Empty means "not given yet"; the first + sets 1.
function GuestCountField({ value, onChange, required }) {
  const count = Number(value) || 0
  const step = (delta) => onChange(String(Math.min(MAX_GUESTS, Math.max(1, count + delta))))
  const STEP_BUTTON =
    'flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-canvas-2 text-body transition-colors hover:bg-gold-500 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-canvas-2 disabled:hover:text-body'

  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-gold-500/60 bg-card p-1.5 focus-within:border-gold-500">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={count <= 1}
        aria-label="Fewer guests"
        className={STEP_BUTTON}
      >
        <Minus className="h-5 w-5" strokeWidth={2.25} />
      </button>
      <label
        htmlFor="wizard-guests"
        className="flex flex-1 cursor-text items-center justify-center gap-2"
      >
        <Users className="h-5 w-5 flex-none text-gold-500" strokeWidth={1.75} />
        <input
          id="wizard-guests"
          type="number"
          inputMode="numeric"
          min="1"
          max={MAX_GUESTS}
          step="1"
          required={required}
          value={value}
          placeholder="0"
          onChange={(event) => onChange(event.target.value)}
          className="w-12 [appearance:textfield] bg-transparent text-center font-display text-2xl font-semibold text-body placeholder:text-body-faint focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-sm text-body-muted">{count === 1 ? 'guest' : 'guests'}</span>
      </label>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={count >= MAX_GUESTS}
        aria-label="More guests"
        className={STEP_BUTTON}
      >
        <Plus className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  )
}

// "Provide two options: 1. Dine-In Now  2. Schedule Dine-In" — the two
// buttons here are that literal choice; the arrival/instructions fields
// only appear once "Schedule Dine-In" is picked.
//
// The table is chosen with the Reservations page's own picker, against
// availability for the slot being booked, and placing the order books it
// as a reservation — which is why guest count matters for Dine-In Now too
// once a table is picked.
export function DineInDetailsFields({
  mode,
  onModeChange,
  tables,
  tableId,
  onTableChange,
  scheduledArrivalTime,
  onArrivalChange,
  guestCount,
  onGuestCountChange,
  specialInstructions,
  onSpecialInstructionsChange,
  suggestedReadyTime,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onModeChange('now')}
          aria-pressed={mode === 'now'}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            mode === 'now'
              ? 'border-brand-700 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-100'
              : 'border-rule text-body-muted hover:border-brand-200 hover:text-body'
          }`}
        >
          Dine-In Now
        </button>
        <button
          type="button"
          onClick={() => onModeChange('schedule')}
          aria-pressed={mode === 'schedule'}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            mode === 'schedule'
              ? 'border-brand-700 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-100'
              : 'border-rule text-body-muted hover:border-brand-200 hover:text-body'
          }`}
        >
          Schedule Dine-In
        </button>
      </div>

      {mode === 'now' && (
        <div className="flex flex-col gap-1.5 sm:max-w-xs">
          <label htmlFor="wizard-guests" className={LABEL}>
            Number of Guests{' '}
            {!tableId && <span className={OPTIONAL}>(needed to book a table)</span>}
          </label>
          <GuestCountField
            value={guestCount}
            onChange={onGuestCountChange}
            required={Boolean(tableId)}
          />
        </div>
      )}

      {mode === 'schedule' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="wizard-arrival" className={LABEL}>
                Arrival Date &amp; Time
              </label>
              <input
                id="wizard-arrival"
                type="datetime-local"
                min={nowLocalDateTime()}
                required
                value={scheduledArrivalTime}
                onChange={(event) => onArrivalChange(event.target.value)}
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="wizard-guests" className={LABEL}>
                Number of Guests
              </label>
              <GuestCountField value={guestCount} onChange={onGuestCountChange} required />
            </div>
          </div>

          {suggestedReadyTime && (
            <p className={NOTE}>
              We&apos;ll aim to have your food ready around <strong>{suggestedReadyTime}</strong> —
              just before you arrive. The restaurant will confirm the exact time.
            </p>
          )}
        </>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={LABEL}>
            Table <span className={OPTIONAL}>(optional — booked as a reservation)</span>
          </span>
          <button
            type="button"
            onClick={() => onTableChange('')}
            aria-pressed={!tableId}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              !tableId
                ? 'border-brand-700 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-100'
                : 'border-rule text-body-muted hover:border-brand-200 hover:text-body'
            }`}
          >
            No preference — assign me a table
          </button>
        </div>

        {mode === 'schedule' && !scheduledArrivalTime ? (
          <p className={NOTE}>Pick your arrival time to see which tables are free then.</p>
        ) : (
          <TablePicker
            tables={tables}
            selectedId={tableId}
            onSelect={onTableChange}
            guestCount={guestCount}
            showCost={false}
          />
        )}
      </div>

      {mode === 'schedule' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wizard-dinein-instructions" className={LABEL}>
            Special Instructions <span className={OPTIONAL}>(optional)</span>
          </label>
          <textarea
            id="wizard-dinein-instructions"
            rows={2}
            value={specialInstructions}
            onChange={(event) => onSpecialInstructionsChange(event.target.value)}
            className={FIELD}
          />
        </div>
      )}
    </div>
  )
}
