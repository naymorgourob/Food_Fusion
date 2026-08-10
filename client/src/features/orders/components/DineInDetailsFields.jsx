import { FIELD, LABEL, OPTIONAL, NOTE } from '@/features/orders/components/fieldStyles'

// Today's date/time in the browser's local timezone, formatted for a
// datetime-local input's min attribute — same "client-side nicety, server
// re-validates regardless" pattern as CustomerReservationForm's todayIsoDate.
function nowLocalDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16)
}

// "Provide two options: 1. Dine-In Now  2. Schedule Dine-In" — the two
// buttons here are that literal choice; the arrival/guest/instructions
// fields only appear once "Schedule Dine-In" is picked, exactly matching
// the spec's split (Dine-In Now needs none of that).
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-table" className={LABEL}>
          Table <span className={OPTIONAL}>(optional)</span>
        </label>
        <select id="wizard-table" value={tableId} onChange={(event) => onTableChange(event.target.value)} className={FIELD}>
          <option value="">No preference — assign me a table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              Table {table.number} — seats {table.capacity}
            </option>
          ))}
        </select>
      </div>

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
              <input
                id="wizard-guests"
                type="number"
                min="1"
                step="1"
                required
                value={guestCount}
                onChange={(event) => onGuestCountChange(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          {suggestedReadyTime && (
            <p className={NOTE}>
              We&apos;ll aim to have your food ready around <strong>{suggestedReadyTime}</strong> — just before you arrive.
              The restaurant will confirm the exact time.
            </p>
          )}

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
        </>
      )}
    </div>
  )
}
