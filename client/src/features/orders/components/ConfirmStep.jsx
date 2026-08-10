import { UtensilsCrossed, Bike, ShoppingBag, MapPin, Clock, Users, CreditCard, ScrollText } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'
import { PAYMENT_METHODS } from '@/features/orders/components/PaymentMethodStep'

/**
 * Step 4 — the last look before committing (UI-04).
 *
 * Everything that will be sent is restated here, because this is the point
 * of no return: after this the order hits the kitchen. The recap is
 * assembled from the same state the payload is built from, so it can't
 * drift from what actually gets submitted.
 */

const TYPE_META = {
  DINE_IN: { label: 'Dine-in', icon: UtensilsCrossed },
  DELIVERY: { label: 'Delivery', icon: Bike },
  TAKEAWAY: { label: 'Takeaway', icon: ShoppingBag },
}

function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">{label}</span>
        <span className="text-sm text-body">{children}</span>
      </div>
    </div>
  )
}

export function ConfirmStep({
  items,
  orderType,
  paymentMethod,
  deliveryAddress,
  deliveryPhone,
  scheduledPickupTime,
  dineInMode,
  scheduledArrivalTime,
  guestCount,
  tableLabel,
  specialInstructions,
  total,
}) {
  const typeMeta = TYPE_META[orderType] ?? TYPE_META.DINE_IN
  const method = PAYMENT_METHODS.find((entry) => entry.id === paymentMethod)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">Confirm your order</h2>
        <p className="text-sm text-body-muted">
          One last look — your order goes straight to the kitchen after this.
        </p>
      </div>

      {/* --- Items ----------------------------------------------------- */}
      <section aria-labelledby="confirm-items" className="flex flex-col gap-3">
        <h3 id="confirm-items" className="font-display text-sm font-semibold text-body">
          {items.length} {items.length === 1 ? 'dish' : 'dishes'}
        </h3>
        <ul className="flex flex-col gap-2.5">
          {items.map(({ item, quantity, notes }) => {
            const image = getImageUrl(item.imageUrl)
            return (
              <li key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-canvas-2">
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <UtensilsCrossed className="h-4 w-4 text-brand-200 dark:text-brand-400/50" />
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-body">
                    {item.name} <span className="text-body-faint">×{quantity}</span>
                  </span>
                  {notes && <span className="truncate text-xs text-body-faint italic">“{notes}”</span>}
                </div>
                <span className="flex-none text-sm font-semibold text-body">
                  {money(Number(item.price) * quantity)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* --- Fulfilment + payment -------------------------------------- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-rule bg-canvas p-5">
        <Row icon={typeMeta.icon} label="Order type">
          {typeMeta.label}
          {orderType === 'DINE_IN' && dineInMode === 'now' ? ' — right now' : ''}
        </Row>

        {orderType === 'DELIVERY' && (
          <>
            <Row icon={MapPin} label="Delivering to">
              {deliveryAddress}
            </Row>
            <Row icon={Users} label="Contact">
              {deliveryPhone}
            </Row>
          </>
        )}

        {orderType === 'TAKEAWAY' && (
          <Row icon={Clock} label="Pickup time">
            {formatDateTime(scheduledPickupTime) ?? '—'}
          </Row>
        )}

        {orderType === 'DINE_IN' && dineInMode === 'schedule' && (
          <>
            <Row icon={Clock} label="Arriving">
              {formatDateTime(scheduledArrivalTime) ?? '—'}
            </Row>
            <Row icon={Users} label="Guests">
              {guestCount || '—'}
            </Row>
          </>
        )}

        {orderType === 'DINE_IN' && tableLabel && (
          <Row icon={UtensilsCrossed} label="Table">
            {tableLabel}
          </Row>
        )}

        <Row icon={CreditCard} label="Paying by">
          {method?.label ?? 'At the restaurant'}
          <span className="block text-xs text-body-faint">Payment is taken at the restaurant</span>
        </Row>

        {specialInstructions && (
          <Row icon={ScrollText} label="Notes for the kitchen">
            {specialInstructions}
          </Row>
        )}
      </section>

      {/* --- Total ------------------------------------------------------ */}
      <div className="flex items-baseline justify-between rounded-2xl bg-brand-800 px-5 py-4 text-white">
        <span className="font-display text-sm font-semibold">Total to pay</span>
        <span className="font-display text-2xl font-semibold text-gold-300">{money(total)}</span>
      </div>
    </div>
  )
}
