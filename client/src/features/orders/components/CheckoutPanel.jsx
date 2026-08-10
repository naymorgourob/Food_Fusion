import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import { OrderTypeSelector } from '@/features/orders/components/OrderTypeSelector'
import { DineInDetailsFields } from '@/features/orders/components/DineInDetailsFields'
import { DeliveryDetailsFields } from '@/features/orders/components/DeliveryDetailsFields'
import { TakeawayDetailsFields } from '@/features/orders/components/TakeawayDetailsFields'
import { OrderReviewStep } from '@/features/orders/components/OrderReviewStep'
import { PaymentMethodStep } from '@/features/orders/components/PaymentMethodStep'
import { ConfirmStep } from '@/features/orders/components/ConfirmStep'
import { CheckoutSummary } from '@/features/orders/components/CheckoutSummary'
import { CheckoutErrorPanel } from '@/features/orders/components/CheckoutErrorPanel'
import { money } from '@/utils/format'

/**
 * The four-step checkout (UI-04): Review → Details → Payment → Confirm.
 *
 * The business logic it drives is unchanged and still owned by
 * NewOrderPage — payload assembly, the per-type required fields, the
 * loyalty clamp, and createOrder are all exactly as they were. This file
 * owns presentation, step gating, and navigation.
 *
 * Order type is chosen at the top of step 2 rather than as its own step:
 * it's the question that decides which fields appear right below it, so
 * splitting them across two screens made a two-second decision cost a
 * full page transition.
 */

const CHECKOUT_STEPS = ['Review', 'Details', 'Payment', 'Confirm']

function StepRail({ current, onJump, furthestReached }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        // Only steps already visited are clickable — jumping ahead would
        // skip the gating that keeps required fields filled in.
        const reachable = index <= furthestReached && index !== current

        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(index)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${label}${done ? ' (completed)' : ''}`}
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold transition-all ${
                done
                  ? 'bg-brand-700 text-white hover:bg-brand-800'
                  : active
                    ? 'bg-gold-500 text-charcoal ring-4 ring-gold-500/20'
                    : 'bg-canvas-2 text-body-faint'
              } ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </button>
            <span
              className={`hidden text-xs font-semibold whitespace-nowrap sm:inline ${
                done || active ? 'text-body' : 'text-body-faint'
              }`}
            >
              {label}
            </span>
            {index < CHECKOUT_STEPS.length - 1 && (
              <span className={`h-px flex-1 ${done ? 'bg-brand-700' : 'bg-rule'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function CheckoutPanel({
  step,
  onStepChange,
  furthestReached,
  orderType,
  onOrderTypeChange,
  dineIn,
  delivery,
  takeaway,
  specialInstructions,
  onSpecialInstructionsChange,
  tables,
  suggestedReadyTime,
  canLeaveDetails,
  cart,
  itemsTotal,
  deliveryCharge,
  loyaltySummary,
  pointsToRedeem,
  onPointsChange,
  appliedPoints,
  loyaltyDiscount,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  errors,
  isSubmitting,
  onSubmit,
  onBackToMenu,
}) {
  const cartItems = cart.items
  const isEmpty = cartItems.length === 0

  const tableLabel = dineIn.tableId
    ? tables.find((table) => table.id === dineIn.tableId)?.number
      ? `Table ${tables.find((table) => table.id === dineIn.tableId).number}`
      : null
    : null

  // Each step decides for itself whether the customer may advance.
  const canAdvance =
    step === 0 ? !isEmpty : step === 1 ? Boolean(orderType) && canLeaveDetails : step === 2 ? Boolean(paymentMethod) : true

  const etaLabel =
    orderType === 'DELIVERY'
      ? '45–60 min after acceptance'
      : orderType === 'TAKEAWAY'
        ? 'Confirmed once accepted'
        : 'Confirmed once accepted'

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBackToMenu}
        className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-body-muted transition-colors hover:text-brand-700 dark:hover:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to the menu
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* --- Main column ------------------------------------------- */}
        <div className="flex flex-col gap-6 rounded-2xl border border-rule bg-card p-5 sm:p-7">
          <StepRail current={step} onJump={onStepChange} furthestReached={furthestReached} />

          <CheckoutErrorPanel
            errors={errors}
            onRetry={onSubmit}
            onChangePayment={() => onStepChange(2)}
            isRetrying={isSubmitting}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <OrderReviewStep
                  items={cartItems}
                  onSetQuantity={cart.setQuantity}
                  onSetNotes={cart.setNotes}
                  onRemove={cart.remove}
                  onBrowseMenu={onBackToMenu}
                />
              )}

              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-lg font-semibold text-body">
                      How would you like it?
                    </h2>
                    <p className="text-sm text-body-muted">
                      Pick a service type, then tell us the details.
                    </p>
                  </div>

                  <OrderTypeSelector value={orderType} onSelect={onOrderTypeChange} />

                  {orderType && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-rule pt-5"
                    >
                      {orderType === 'DINE_IN' && (
                        <DineInDetailsFields
                          mode={dineIn.mode}
                          onModeChange={dineIn.onModeChange}
                          tables={tables}
                          tableId={dineIn.tableId}
                          onTableChange={dineIn.onTableChange}
                          scheduledArrivalTime={dineIn.scheduledArrivalTime}
                          onArrivalChange={dineIn.onArrivalChange}
                          guestCount={dineIn.guestCount}
                          onGuestCountChange={dineIn.onGuestCountChange}
                          specialInstructions={specialInstructions}
                          onSpecialInstructionsChange={onSpecialInstructionsChange}
                          suggestedReadyTime={suggestedReadyTime}
                        />
                      )}

                      {orderType === 'DELIVERY' && (
                        <DeliveryDetailsFields
                          deliveryAddress={delivery.address}
                          onAddressChange={delivery.onAddressChange}
                          deliveryPhone={delivery.phone}
                          onPhoneChange={delivery.onPhoneChange}
                          specialInstructions={specialInstructions}
                          onSpecialInstructionsChange={onSpecialInstructionsChange}
                          deliveryChargePreview={deliveryCharge || 3}
                        />
                      )}

                      {orderType === 'TAKEAWAY' && (
                        <TakeawayDetailsFields
                          scheduledPickupTime={takeaway.scheduledPickupTime}
                          onPickupTimeChange={takeaway.onPickupTimeChange}
                          specialInstructions={specialInstructions}
                          onSpecialInstructionsChange={onSpecialInstructionsChange}
                        />
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {step === 2 && (
                <PaymentMethodStep
                  selected={paymentMethod}
                  onSelect={onPaymentMethodChange}
                  orderType={orderType}
                  loyaltySummary={loyaltySummary}
                  itemsTotal={itemsTotal}
                  pointsToRedeem={pointsToRedeem}
                  onPointsChange={onPointsChange}
                  appliedPoints={appliedPoints}
                  loyaltyDiscount={loyaltyDiscount}
                />
              )}

              {step === 3 && (
                <ConfirmStep
                  items={cartItems}
                  orderType={orderType}
                  paymentMethod={paymentMethod}
                  deliveryAddress={delivery.address}
                  deliveryPhone={delivery.phone}
                  scheduledPickupTime={takeaway.scheduledPickupTime}
                  dineInMode={dineIn.mode}
                  scheduledArrivalTime={dineIn.scheduledArrivalTime}
                  guestCount={dineIn.guestCount}
                  tableLabel={tableLabel}
                  specialInstructions={specialInstructions}
                  total={grandTotal}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* --- Navigation ------------------------------------------ */}
          <div className="flex items-center justify-between gap-3 border-t border-rule pt-5">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => onStepChange(step - 1)}
                className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => onStepChange(step + 1)}
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || isEmpty}
                onClick={onSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <ShoppingBag className="h-4 w-4" />
                {isSubmitting ? 'Placing order…' : `Place order · ${money(grandTotal)}`}
              </button>
            )}
          </div>
        </div>

        {/* --- Sticky summary ---------------------------------------- */}
        {!isEmpty && (
          <CheckoutSummary
            items={cartItems}
            subtotal={itemsTotal}
            deliveryCharge={deliveryCharge}
            loyaltyDiscount={loyaltyDiscount}
            appliedPoints={appliedPoints}
            total={grandTotal}
            orderType={orderType}
            etaLabel={orderType ? etaLabel : null}
            className="lg:sticky lg:top-24"
          />
        )}
      </div>
    </div>
  )
}
