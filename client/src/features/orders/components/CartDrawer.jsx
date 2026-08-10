import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed, ArrowRight, Tag } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'

/**
 * Slide-in cart (UI-03).
 *
 * The totals here mirror exactly what order.service.js computes on submit —
 * food subtotal, the flat delivery charge for DELIVERY orders, and the
 * loyalty discount capped at the food total. It is still a *preview*: the
 * server recalculates everything from its own price and balance reads.
 *
 * A promo-code field was requested. There is no promotion/coupon model in
 * the schema and no endpoint to validate a code against, so the discount
 * row instead surfaces the real, working discount mechanism this system
 * has — loyalty points, redeemed on the review step.
 */
export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotal,
  count,
  deliveryCharge = 0,
  loyaltyDiscount = 0,
  onSetQuantity,
  onRemove,
  onCheckout,
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  const total = Math.max(0, subtotal + deliveryCharge - loyaltyDiscount)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-canvas shadow-2xl"
          >
            {/* --- Header ------------------------------------------------ */}
            <header className="flex flex-none items-center justify-between border-b border-rule px-5 py-4">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-body">
                <ShoppingBag className="h-5 w-5 text-brand-700 dark:text-brand-400" />
                Your order
                {count > 0 && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                    {count}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* --- Lines -------------------------------------------------- */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
                    <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
                    <ShoppingBag className="relative h-7 w-7 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
                  </span>
                  <p className="font-display text-base font-semibold text-body">Your cart is empty</p>
                  <p className="max-w-[15rem] text-sm text-body-muted">
                    Add a dish from the menu and it will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-1 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                  >
                    Browse the menu
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {items.map(({ item, quantity, notes }) => {
                      const image = getImageUrl(item.imageUrl)
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-3 rounded-2xl border border-rule bg-card p-3"
                        >
                          <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-canvas-2">
                            {image ? (
                              <img src={image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center">
                                <UtensilsCrossed className="h-5 w-5 text-brand-200 dark:text-brand-400/50" />
                              </span>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-body">{item.name}</span>
                              <span className="flex-none text-sm font-semibold text-body">
                                {money(Number(item.price) * quantity)}
                              </span>
                            </div>

                            {notes && (
                              <span className="line-clamp-1 text-xs text-body-faint italic">“{notes}”</span>
                            )}

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-0.5 rounded-full border border-rule">
                                <button
                                  type="button"
                                  onClick={() => onSetQuantity(item.id, quantity - 1, item)}
                                  aria-label={`Decrease ${item.name} quantity`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold text-body">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => onSetQuantity(item.id, quantity + 1, item)}
                                  aria-label={`Increase ${item.name} quantity`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                aria-label={`Remove ${item.name} from your order`}
                                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* --- Summary ----------------------------------------------- */}
            {items.length > 0 && (
              <footer className="flex-none border-t border-rule bg-card px-5 py-4">
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
                        Loyalty discount
                      </dt>
                      <dd>−{money(loyaltyDiscount)}</dd>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between border-t border-rule pt-3 font-display text-base font-semibold text-body">
                    <dt>Total</dt>
                    <dd>{money(total)}</dd>
                  </div>
                </dl>

                <p className="mt-2 text-xs text-body-faint">
                  Redeem loyalty points at the review step.
                </p>

                <button
                  type="button"
                  onClick={onCheckout}
                  className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
