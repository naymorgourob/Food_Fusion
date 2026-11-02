import { motion } from 'framer-motion'
import {
  Check,
  CreditCard,
  Smartphone,
  Info,
  Sparkles,
  Upload,
  ShieldCheck,
  Wallet,
  ConciergeBell,
} from 'lucide-react'
import { money } from '@/utils/format'
import { ADVANCE_PERCENT } from '@/constants/payments'

/**
 * Payment method selection (UI-04).
 *
 * Pay online: the customer pays the advance now, either on SSLCommerz's
 * secure page (ONLINE — the server confirms it with SSLCommerz) or by
 * sending money with bKash/Nagad/Rocket/bank transfer and submitting the
 * transaction ID or a screenshot for staff to verify.
 *
 * Pay manually (AT_RESTAURANT): no advance. The server assigns a waiter,
 * who settles the payment with the customer and serves the food.
 */

export const PAY_AT_RESTAURANT = 'AT_RESTAURANT'

const METHODS = [
  {
    id: 'ONLINE',
    label: 'Card or internet banking',
    hint: 'SSLCommerz secure page, confirmed instantly',
    icon: ShieldCheck,
  },
  { id: 'BKASH', label: 'bKash', hint: 'Send money, then add the TrxID', icon: Smartphone },
  { id: 'NAGAD', label: 'Nagad', hint: 'Send money, then add the TrxID', icon: Smartphone },
  { id: 'ROCKET', label: 'Rocket', hint: 'Send money, then add the TrxID', icon: Smartphone },
  {
    id: 'CARD',
    label: 'Bank transfer',
    hint: 'Transfer, then add the reference',
    icon: CreditCard,
  },
]
const MAX_LOYALTY_DISCOUNT_PERCENT = 5

function ModeCard({ active, onClick, icon: Icon, title, badge, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
        active
          ? 'border-gold-500 bg-gold-100/50 dark:bg-gold-100/10'
          : 'border-rule bg-card hover:border-gold-300'
      }`}
    >
      <span
        className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${
          active ? 'bg-gold-500 text-charcoal' : 'bg-canvas-2 text-body-muted'
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-base font-semibold text-body">
          {title}
          {badge && (
            <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-bold text-gold-700 dark:text-gold-300">
              {badge}
            </span>
          )}
        </span>
        <span className="text-sm text-body-muted">{children}</span>
      </span>
      {active && (
        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gold-500 text-charcoal">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

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
  advanceAmount,
  paymentReference,
  onPaymentReferenceChange,
  paymentProof,
  onPaymentProofChange,
  paymentContact,
}) {
  const pointValue = loyaltySummary?.pointValue ?? 0
  const currentPoints = loyaltySummary?.currentPoints ?? 0
  const maxRedeemable = Math.min(
    currentPoints,
    pointValue > 0
      ? Math.floor((itemsTotal * (MAX_LOYALTY_DISCOUNT_PERCENT / 100)) / pointValue)
      : 0,
  )
  const redeeming = Number(pointsToRedeem) > 0
  const payingOnline = selected !== PAY_AT_RESTAURANT
  const needsProof = payingOnline && selected !== 'ONLINE'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">How would you like to pay?</h2>
        <p className="text-sm text-body-muted">
          Pay the {ADVANCE_PERCENT}% advance online now, or pay manually at the restaurant.
        </p>
      </div>

      <div role="radiogroup" aria-label="Payment option" className="flex flex-col gap-3">
        <ModeCard
          active={payingOnline}
          onClick={() => !payingOnline && onSelect('ONLINE')}
          icon={ShieldCheck}
          title="Pay online now"
          badge="Recommended"
        >
          Pay the advance by card, bKash, Nagad, Rocket or bank transfer.
        </ModeCard>
        <ModeCard
          active={!payingOnline}
          onClick={() => onSelect(PAY_AT_RESTAURANT)}
          icon={ConciergeBell}
          title="Pay manually"
        >
          No advance. A waiter is assigned to your order to take your payment and serve your food.
        </ModeCard>
      </div>

      {payingOnline && (
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-gold-300 bg-gold-100/60 p-5 dark:border-gold-700 dark:bg-gold-100/10">
            <span className="text-xs font-semibold tracking-wide text-body-muted uppercase">
              Advance payment required
            </span>
            <strong className="font-display text-2xl text-body">{money(advanceAmount)}</strong>
            <span className="text-xs text-body-muted">
              {ADVANCE_PERCENT}% of your order total. The rest is paid on your final bill.
            </span>
            <span className="text-sm font-semibold text-body">
              Pay to {paymentContact?.restaurantName || 'FoodFusion'}:{' '}
              {paymentContact?.restaurantPhone || 'Contact the restaurant'}
            </span>
          </div>

          {/* --- Online method cards -------------------------------------- */}
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Online payment method</legend>
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
                      id === 'ONLINE' ? 'sm:col-span-2' : ''
                    } ${
                      active
                        ? 'border-brand-700 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30'
                        : 'border-rule bg-card hover:-translate-y-0.5 hover:border-brand-200'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl transition-colors ${
                        active ? 'bg-brand-700 text-white' : 'bg-canvas-2 text-body-muted'
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
        </>
      )}

      {needsProof && (
        <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-canvas p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-body-muted">
              Transaction ID / Reference ID
            </span>
            <input
              value={paymentReference}
              onChange={(event) => onPaymentReferenceChange(event.target.value)}
              className="rounded-xl border border-rule bg-card px-3 py-2.5 text-sm text-body"
              placeholder="e.g. TXN123456"
            />
          </label>
          <div className="text-center text-xs text-body-faint">or</div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rule bg-card px-4 py-3 text-sm text-body-muted">
            <Upload className="h-4 w-4 flex-none" />
            <span>{paymentProof ? paymentProof.name : 'Upload payment screenshot or photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onPaymentProofChange(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
          <p className="flex items-start gap-2 text-xs text-body-faint">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
            Your proof is sent to the restaurant for verification before the order is accepted.
          </p>
        </div>
      )}

      {!payingOnline && (
        <p className="flex items-start gap-2 rounded-2xl border border-rule bg-canvas p-5 text-sm text-body-muted">
          <Wallet className="mt-0.5 h-4 w-4 flex-none" />
          You pay the full bill at the restaurant by cash, card or mobile banking. Your waiter will
          confirm the payment with you when your food is served.
        </p>
      )}

      {/* --- Loyalty redemption --------------------------------------- */}
      {loyaltySummary && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gold-300/70 bg-gold-100/40 p-5 dark:border-gold-700/60 dark:bg-gold-100/10">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-display text-sm font-semibold text-body">
              <Sparkles className="h-4 w-4 text-gold-500" />
              Loyalty points
            </span>
            <span className="text-xs font-medium text-body-muted">{currentPoints} available</span>
          </div>

          <p className="text-xs leading-relaxed text-body-muted">
            Use points for a small discount of up to {MAX_LOYALTY_DISCOUNT_PERCENT}% of your food
            subtotal.
            {currentPoints === 0 ? ' Complete orders to start earning points.' : ''}
          </p>

          {currentPoints > 0 && maxRedeemable > 0 && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="checkout-redeem-points"
                  className="text-xs font-medium text-body-muted"
                >
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
          )}

          {loyaltyDiscount > 0 && (
            <p
              aria-live="polite"
              className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
            >
              You save {money(loyaltyDiscount)} with {appliedPoints} points.
            </p>
          )}
          {currentPoints > 0 && maxRedeemable === 0 && (
            <p className="text-xs text-body-faint">
              This order is too small to apply a loyalty discount.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Every method the checkout can record, for labels on the confirm and
// success screens.
const ALL_METHODS = [...METHODS, { id: PAY_AT_RESTAURANT, label: 'Pay at the restaurant' }]

export { ALL_METHODS as PAYMENT_METHODS }
