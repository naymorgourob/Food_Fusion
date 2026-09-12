import { FIELD, LABEL, OPTIONAL, NOTE } from '@/features/orders/components/fieldStyles'
import { money } from '@/utils/format'

// deliveryCharge is a flat constant applied server-side (order.service.js)
// — shown here as a preview only, matching whatever the server will
// actually charge, so the customer isn't surprised at review time.
export function DeliveryDetailsFields({
  deliveryAddress,
  onAddressChange,
  deliveryPhone,
  onPhoneChange,
  specialInstructions,
  onSpecialInstructionsChange,
  deliveryChargePreview,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-delivery-address" className={LABEL}>
          Delivery Address
        </label>
        <textarea
          id="wizard-delivery-address"
          rows={2}
          required
          value={deliveryAddress}
          onChange={(event) => onAddressChange(event.target.value)}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-delivery-phone" className={LABEL}>
          Phone Number
        </label>
        <input
          id="wizard-delivery-phone"
          required
          value={deliveryPhone}
          onChange={(event) => onPhoneChange(event.target.value)}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wizard-delivery-instructions" className={LABEL}>
          Special Instructions <span className={OPTIONAL}>(optional)</span>
        </label>
        <textarea
          id="wizard-delivery-instructions"
          rows={2}
          value={specialInstructions}
          onChange={(event) => onSpecialInstructionsChange(event.target.value)}
          className={FIELD}
        />
      </div>

      <p className={NOTE}>
        Delivery charge: {money(deliveryChargePreview)} — the restaurant will confirm your estimated delivery
        time once the order is accepted.
      </p>
    </div>
  )
}
