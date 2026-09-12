import { Sparkles } from 'lucide-react'
import { money } from '@/utils/format'

/**
 * The checkout redemption control. Everything shown here is a preview —
 * order.service.js recomputes the discount and re-checks the balance
 * server-side, since a client-side cap on its own would be no cap at all.
 *
 * maxRedeemable caps the input at whichever runs out first: the
 * customer's balance, or the points needed to zero out the order.
 */
export function LoyaltyRedeemField({ summary, itemsTotal, pointsToRedeem, onChange }) {
  if (!summary || summary.currentPoints <= 0) return null

  const { currentPoints, pointValue } = summary
  const pointsNeededForFullDiscount = pointValue > 0 ? Math.ceil(itemsTotal / pointValue) : 0
  const maxRedeemable = Math.min(currentPoints, pointsNeededForFullDiscount)

  const applied = Math.min(Math.max(0, Number(pointsToRedeem) || 0), maxRedeemable)
  // Capped at the order total for the same reason order.service.js caps it:
  // points can't buy more than the food costs. Without the cap this row
  // would show a bigger discount than the order summary right below it.
  const discount = Math.min(applied * pointValue, itemsTotal)
  const remainingPoints = currentPoints - applied

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ember-100 bg-ember-50/40 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-ember-600" />
        <span className="text-sm font-semibold text-ink">Use Loyalty Points</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wizard-redeem-points" className="text-xs font-medium text-ink-muted">
            Points to redeem
          </label>
          <input
            id="wizard-redeem-points"
            type="number"
            min="0"
            max={maxRedeemable}
            step="1"
            value={pointsToRedeem}
            onChange={(event) => onChange(event.target.value)}
            className="w-32 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange(String(maxRedeemable))}
          className="rounded-md border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
        >
          Use max ({maxRedeemable})
        </button>
      </div>

      <dl className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Available Points</dt>
          <dd className="font-medium text-ink">{currentPoints}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Discount Applied</dt>
          <dd className="font-medium text-success">−{money(discount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Remaining Points</dt>
          <dd className="font-medium text-ink">{remainingPoints}</dd>
        </div>
      </dl>
    </div>
  )
}
