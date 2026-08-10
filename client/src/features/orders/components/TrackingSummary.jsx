import { UtensilsCrossed, ScrollText, Tag } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'
import { orderGrandTotal } from '@/features/orders/constants'

/**
 * Items and money for one order (UI-05).
 *
 * Two different money stories are possible here, and which one applies
 * depends on whether staff have generated a bill yet:
 *
 *   - No bill: the order total is food + delivery − loyalty. VAT hasn't
 *     been calculated, so it is named as pending rather than shown as a
 *     number, matching the checkout summary.
 *   - Bill exists: the invoiced grand total is shown as authoritative,
 *     because at that point it is a fact rather than an estimate.
 *
 * The per-line VAT/discount breakdown is deliberately NOT rendered here:
 * the orders API's BILL_SELECT returns only billNumber, billDate,
 * grandTotal and paymentStatus (see order.service.js), so vatAmount and
 * discount aren't in this payload at all. Rendering them would print
 * blanks beside a real total. The full breakdown lives on the Payment
 * History page, which reads the billing API directly.
 */
export function TrackingSummary({ order }) {
  const bill = order.bill
  const deliveryCharge = Number(order.deliveryCharge || 0)
  const loyaltyDiscount = Number(order.loyaltyDiscount || 0)

  return (
    <section
      aria-labelledby="tracking-summary-heading"
      className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5"
    >
      <h2 id="tracking-summary-heading" className="font-display text-lg font-semibold text-body">
        Your order
      </h2>

      {/* --- Items ---------------------------------------------------- */}
      <ul className="flex flex-col gap-3">
        {order.items.map((item) => {
          const image = getImageUrl(item.menuItem?.imageUrl)
          return (
            <li key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-canvas-2">
                {image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
                    <UtensilsCrossed className="h-4 w-4 text-brand-200 dark:text-brand-400/50" />
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-body">{item.menuItem.name}</span>
                <span className="text-xs text-body-faint">
                  {money(item.unitPrice ?? item.menuItem.price)} × {item.quantity}
                </span>
              </div>

              <span className="flex-none text-sm font-semibold text-body">
                {money(item.subtotal)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* --- Kitchen notes -------------------------------------------- */}
      {order.specialInstructions && (
        <div className="flex items-start gap-2.5 rounded-xl bg-canvas-2 px-3.5 py-3">
          <ScrollText className="mt-0.5 h-4 w-4 flex-none text-body-faint" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-semibold text-body">Notes for the kitchen</span>
            <span className="text-xs leading-relaxed text-body-muted">
              {order.specialInstructions}
            </span>
          </div>
        </div>
      )}

      {/* --- Money ----------------------------------------------------- */}
      <dl className="flex flex-col gap-2 border-t border-rule pt-4 text-sm">
        {bill ? (
          <>
            <div className="flex justify-between text-body-muted">
              <dt>Food subtotal</dt>
              <dd>{money(order.totalAmount)}</dd>
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
                  Loyalty ({order.pointsRedeemed} pts)
                </dt>
                <dd>−{money(loyaltyDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-body-muted">
              <dt>VAT</dt>
              <dd>Included below</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-rule pt-3">
              <dt className="font-display text-base font-semibold text-body">Invoiced total</dt>
              <dd className="font-display text-lg font-semibold text-brand-700 dark:text-brand-400">
                {money(bill.grandTotal)}
              </dd>
            </div>
            <p className="text-xs text-body-faint">
              Includes VAT. See Payment History for the full breakdown.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-between text-body-muted">
              <dt>Food subtotal</dt>
              <dd>{money(order.totalAmount)}</dd>
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
                  Loyalty ({order.pointsRedeemed} pts)
                </dt>
                <dd>−{money(loyaltyDiscount)}</dd>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-rule pt-3">
              <dt className="font-display text-base font-semibold text-body">Total</dt>
              <dd className="font-display text-lg font-semibold text-brand-700 dark:text-brand-400">
                {money(orderGrandTotal(order))}
              </dd>
            </div>
            <p className="text-xs text-body-faint">
              VAT is added to your final bill at the restaurant.
            </p>
          </>
        )}
      </dl>
    </section>
  )
}
