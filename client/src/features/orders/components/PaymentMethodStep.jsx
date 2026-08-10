import { motion } from 'framer-motion'
import { Check, Banknote, CreditCard, Smartphone, Wallet, Info, Sparkles } from 'lucide-react'
import { money } from '@/utils/format'

/**
 * Payment method selection (UI-04).
 *
 * IMPORTANT — this step is presentational.
 *
 * The backend has no payment processing: there is no paymentMethod field
 * on Order or Bill, BillPaymentStatus is only UNPAID|PAID (no PENDING or
 * FAILED), and bills are created and marked paid by staff through
 * staff-only endpoints. A customer's selection here is therefore NOT sent
 * with the order and NOT stored anywhere — the order is created exactly as
 * it always was, and settlement happens at the restaurant or on delivery.
 *
 * Because of that, the panel says so in plain language. A checkout that
 * silently implied a card had been charged would be the one genuinely
 * harmful version of this screen, so the notice is prominent rather than
 * buried in fine print.
 */

const METHODS = [
  {
    id: 'CASH',
    label: 'Cash',
    hint: 'Pay when your order arrives',
    icon: Banknote,
    availableFor: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'],
  },
  {
    id: 'CARD',
    label: 'Card',
    hint: 'Visa, Mastercard, Amex at the table',
    icon: CreditCard,
    availableFor: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'],
  },
  { id: 'SSLCOMMERZ', label: 'SSLCommerz', hint: 'Online payment gateway', icon: Wallet },
  { id: 'BKASH', label: 'bKash', hint: 'Mobile financial service', icon: Smartphone },
  { id: 'NAGAD', label: 'Nagad', hint: 'Mobile financial service', icon: Smartphone },
  { id: 'ROCKET', label: 'Rocket', hint: 'Mobile financial service', icon: Smartphone },
]

export function PaymentMethodStep({
  selected,
  onSelect,
  orderType,
  loyaltySummary,
  itemsTotal,
  pointsToRedeem,
  onPointsChange,
  appliedPoints,
  loyaltyDiscount,
}) {
  const pointValue = loyaltySummary?.pointValue ?? 0
  const currentPoints = loyaltySummary?.currentPoints ?? 0
  const maxRedeemable = Math.min(
    currentPoints,
    pointValue > 0 ? Math.ceil(itemsTotal / pointValue) : 0,
  )
  const redeeming = Number(pointsToRedeem) > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">How would you like to pay?</h2>
        <p className="text-sm text-body-muted">
          Choose your preferred method — you&rsquo;ll settle up at the restaurant.
        </p>
      </div>

      {/* --- Method cards --------------------------------------------- */}
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Payment method</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {METHODS.map(({ id, label, hint, icon: Icon, availableFor }) => {
            const disabled = availableFor && !availableFor.includes(orderType)
            const active = selected === id

            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => onSelect(id)}
                className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-brand-700 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30'
                    : 'border-rule bg-card hover:-translate-y-0.5 hover:border-brand-200'
                }`}
              >
                <span
                  className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl transition-colors ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'bg-canvas-2 text-body-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>

                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-sm font-semibold text-body">{label}</span>
                  <span className="truncate text-xs text-body-faint">{hint}</span>
                </span>

                {active && (
                  <motion.span
                    layoutId="payment-method-check"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="ml-auto flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-700 text-white"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </motion.span>
                )}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* The honesty notice. Deliberately not fine print. */}
      <p className="flex items-start gap-2.5 rounded-xl border border-gold-300 bg-gold-100/60 px-4 py-3 text-sm text-charcoal dark:border-gold-700 dark:bg-gold-100/10 dark:text-body">
        <Info className="mt-0.5 h-4 w-4 flex-none text-gold-700 dark:text-gold-300" />
        <span>
          No payment is taken online. Your order is sent to the kitchen now, and you pay by your
          chosen method at the restaurant or on delivery.
        </span>
      </p>

      {/* --- Loyalty redemption --------------------------------------- */}
      {currentPoints > 0 && maxRedeemable > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-canvas p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-display text-sm font-semibold text-body">
              <Sparkles className="h-4 w-4 text-gold-500" />
              Loyalty points
            </span>
            <span className="text-xs font-medium text-body-muted">
              {currentPoints} available
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkout-redeem-points" className="text-xs font-medium text-body-muted">
                Points to redeem
              </label>
              <input
                id="checkout-redeem-points"
                type="number"
                min="0"
                max={maxRedeemable}
                step="1"
                value={pointsToRedeem}
                onChange={(event) => onPointsChange(event.target.value)}
                className="w-32 rounded-xl border border-rule bg-card px-3 py-2.5 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              />
            </div>
            <button
              type="button"
              onClick={() => onPointsChange(String(maxRedeemable))}
              className="rounded-full border border-rule px-4 py-2.5 text-xs font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
            >
              Use max ({maxRedeemable})
            </button>
            {redeeming && (
              <button
                type="button"
                onClick={() => onPointsChange('')}
                className="rounded-full px-3 py-2.5 text-xs font-semibold text-body-faint transition-colors hover:text-body"
              >
                Clear
              </button>
            )}
          </div>

          {loyaltyDiscount > 0 && (
            <p
              aria-live="polite"
              className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
            >
              You save {money(loyaltyDiscount)} with {appliedPoints} points.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export { METHODS as PAYMENT_METHODS }
