import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, UtensilsCrossed, PencilLine, ShoppingBag } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'
import { EmptyState } from '@/components/customer/ui'

/**
 * Step 1 — review and edit the order before committing (UI-04).
 *
 * Editing here rather than forcing a trip back to the menu is the point:
 * "change the quantity" and "drop that one" are the two things people
 * actually want at checkout, and previously both meant navigating away and
 * losing your place in the flow.
 *
 * Per-item notes are editable inline for the same reason. They are folded
 * into the order's specialInstructions on submit, because OrderItem has no
 * notes column — see NewOrderPage.handleSubmit.
 */
export function OrderReviewStep({ items, onSetQuantity, onSetNotes, onRemove, onBrowseMenu }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add a dish from the menu and it will show up here, ready to check out."
        actionLabel="Browse the menu"
        onAction={onBrowseMenu}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">Review your order</h2>
        <p className="text-sm text-body-muted">
          {items.length} {items.length === 1 ? 'dish' : 'dishes'} — adjust anything before you
          continue.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map(({ item, quantity, notes }) => {
            const image = getImageUrl(item.imageUrl)
            const lineTotal = Number(item.price) * quantity

            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4"
              >
                <div className="flex gap-4">
                  <div className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-canvas-2">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
                        <UtensilsCrossed
                          className="h-6 w-6 text-brand-200 dark:text-brand-400/50"
                          strokeWidth={1.5}
                        />
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-display text-sm font-semibold text-body">
                          {item.name}
                        </span>
                        <span className="text-xs text-body-faint">
                          {money(item.price)} each
                          {item.category?.name ? ` · ${item.category.name}` : ''}
                        </span>
                      </div>
                      <span className="flex-none font-display text-base font-semibold text-body">
                        {money(lineTotal)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-0.5 rounded-full border border-rule">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(item.id, quantity - 1, item)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <motion.span
                          key={quantity}
                          initial={{ scale: 0.7, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          aria-live="polite"
                          className="w-7 text-center text-sm font-semibold text-body"
                        >
                          {quantity}
                        </motion.span>
                        <button
                          type="button"
                          onClick={() => onSetQuantity(item.id, quantity + 1, item)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name} from your order`}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-body-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Per-item note */}
                <div className="flex items-center gap-2 border-t border-rule pt-3">
                  <PencilLine className="h-3.5 w-3.5 flex-none text-body-faint" />
                  <input
                    type="text"
                    value={notes ?? ''}
                    onChange={(event) => onSetNotes(item.id, event.target.value)}
                    placeholder="Add a note for the kitchen (optional)"
                    aria-label={`Special instructions for ${item.name}`}
                    className="w-full bg-transparent text-sm text-body placeholder:text-body-faint focus:outline-none"
                  />
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <button
        type="button"
        onClick={onBrowseMenu}
        className="w-fit text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
      >
        + Add more dishes
      </button>
    </div>
  )
}
