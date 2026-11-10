import { Check, Sparkles, Wallet, ConciergeBell, Smartphone } from 'lucide-react'
import { money } from '@/utils/format'
import { ADVANCE_PERCENT } from '@/constants/payments'
import { AdvancePaymentFields } from '@/features/payments/components/AdvancePaymentFields'
import {
  PAY_AT_RESTAURANT,
  PAYMENT_METHOD_LABELS,
  availableAdvanceMethods,
} from '@/features/payments/constants'

/**
 * Payment method selection (UI-04).
 *
 * Pay advance now: the customer sends the advance to the restaurant's
 * bKash/Nagad/Rocket/bank account and enters the TrxID. Admin checks the
 * money arrived and approves it; the kitchen accepts the order after that.
 *
 * Pay at the restaurant (AT_RESTAURANT): no advance. The server assigns a
 * waiter, who settles the payment with the customer and serves the food.
 */

export { PAY_AT_RESTAURANT }

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
  const payingAdvance = selected !== PAY_AT_RESTAURANT

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">How would you like to pay?</h2>
        <p className="text-sm text-body-muted">
          Send the {ADVANCE_PERCENT}% advance now, or pay everything at the restaurant.
        </p>
      </div>

      <div role="radiogroup" aria-label="Payment option" className="flex flex-col gap-3">
        <ModeCard
          active={payingAdvance}
          onClick={() =>
            !payingAdvance && onSelect(availableAdvanceMethods(paymentContact?.accounts)[0]?.id ?? '')
          }
          icon={Smartphone}
          title="Pay advance now"
          badge="Recommended"
        >
          Send the advance by bKash, Nagad, Rocket or bank transfer.
        </ModeCard>
        <ModeCard
          active={!payingAdvance}
          onClick={() => onSelect(PAY_AT_RESTAURANT)}
          icon={ConciergeBell}
          title="Pay at the restaurant"
        >
          No advance. A waiter is assigned to your order to take your payment and serve your food.
        </ModeCard>
      </div>

      {payingAdvance && (
        <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-canvas p-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-body-muted uppercase">
              Advance payment required
            </span>
            <strong className="font-display text-2xl text-body">{money(advanceAmount)}</strong>
            <span className="text-xs text-body-muted">
              {ADVANCE_PERCENT}% of your order total. The rest is paid on your final bill.
            </span>
          </div>
          <AdvancePaymentFields
            accounts={paymentContact?.accounts}
            method={selected}
            onMethodChange={onSelect}
            reference={paymentReference}
            onReferenceChange={onPaymentReferenceChange}
            proof={paymentProof}
            onProofChange={onPaymentProofChange}
            advanceAmount={advanceAmount}
            approvalNote="The restaurant checks your payment and approves it. The kitchen starts on your order after that, during opening hours (11 AM – 11 PM)."
          />
        </div>
      )}

      {!payingAdvance && (
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
export const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS).map(([id, label]) => ({
  id,
  label,
}))
