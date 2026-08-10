import { Clock, Tag, ShoppingBag } from 'lucide-react'
import { money } from '@/utils/format'

/**
 * Sticky order-summary card (UI-04).
 *
 * Every figure here matches what order.service.js computes on submit:
 * food subtotal + delivery charge − loyalty discount. It is a preview —
 * the server recalculates from its own price and balance reads.
 *
 * VAT is deliberately shown as a note rather than a number. Bill applies
 * vatPercent at billing time, which happens *after* the order is placed,
 * and the rate lives in Settings behind an admin-only endpoint that a
 * customer cannot read. Printing a guessed percentage here would put a
 * wrong total in front of someone about to commit to a purchase, so the
 * card states when VAT lands instead of inventing a figure.
 */
export function CheckoutSummary({
  items,
  subtotal,
  deliveryCharge,
  loyaltyDiscount,
  appliedPoints,
  total,
  orderType,
  etaLabel,
  className = '',
}) {
  return (
    <aside
      aria-labelledby="checkout-summary-heading"
      className={`flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 ${className}`}
    >
      <h2
        id="checkout-summary-heading"
        className="flex items-center gap-2 font-display text-base font-semibold text-body"
      >
        <ShoppingBag className="h-4 w-4 text-brand-700 dark:text-brand-400" />
        Order summary
      </h2>

      {/* Compact line list — the editable version lives in step 1. */}
      {items.length > 0 && (
        <ul className="flex max-h-44 flex-col gap-2 overflow-y-auto border-b border-rule pb-3 text-sm">
          {items.map(({ item, quantity }) => (
            <li key={item.id} className="flex justify-between gap-3 text-body-muted">
              <span className="min-w-0 truncate">
                <span className="text-body">{item.name}</span>
                <span className="text-body-faint"> ×{quantity}</span>
              </span>
              <span className="flex-none">{money(Number(item.price) * quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-body-muted">
          <dt>Subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>

        {deliveryCharge > 0 && (
          <div className="flex justify-between text-body-muted">
            <dt>Delivery charge</dt>
            <dd>{money(deliveryCharge)}</dd>
          </div>
        )}

        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-brand-700 dark:text-brand-400">
            <dt className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Loyalty ({appliedPoints} pts)
            </dt>
            <dd>−{money(loyaltyDiscount)}</dd>
          </div>
        )}

        <div className="mt-1 flex items-baseline justify-between border-t border-rule pt-3">
          <dt className="font-display text-base font-semibold text-body">Total</dt>
          <dd className="font-display text-xl font-semibold text-brand-700 dark:text-brand-400">
            {money(total)}
          </dd>
        </div>
      </dl>

      <p className="rounded-lg bg-canvas-2 px-3 py-2 text-xs leading-relaxed text-body-faint">
        VAT is calculated on your final bill at the restaurant.
      </p>

      {etaLabel && (
        <p className="flex items-center gap-2 text-xs font-medium text-body-muted">
          <Clock className="h-3.5 w-3.5 text-brand-700 dark:text-brand-400" />
          {orderType === 'DELIVERY' ? 'Estimated delivery' : 'Estimated ready'}: {etaLabel}
        </p>
      )}
    </aside>
  )
}
