import { FIELD, LABEL, OPTIONAL } from '@/features/orders/components/fieldStyles'

function nowLocalDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16)
}

export function TakeawayDetailsFields({
  scheduledPickupTime,
  onPickupTimeChange,
  specialInstructions,
  onSpecialInstructionsChange,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-pickup-time" className={LABEL}>
          Pickup Time
        </label>
        <input
          id="wizard-pickup-time"
          type="datetime-local"
          min={nowLocalDateTime()}
          required
          value={scheduledPickupTime}
          onChange={(event) => onPickupTimeChange(event.target.value)}
          className={FIELD}
        />
        <p className="text-xs text-body-faint">
          The restaurant will confirm the estimated ready time once your order is accepted.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-takeaway-instructions" className={LABEL}>
          Special Instructions <span className={OPTIONAL}>(optional)</span>
        </label>
        <textarea
          id="wizard-takeaway-instructions"
          rows={2}
          value={specialInstructions}
          onChange={(event) => onSpecialInstructionsChange(event.target.value)}
          className={FIELD}
        />
      </div>
    </div>
  )
}
