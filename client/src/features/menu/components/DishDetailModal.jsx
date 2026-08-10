import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Minus, Plus, UtensilsCrossed, Heart, ShoppingBag } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'

/**
 * Full-detail view for one dish (UI-03).
 *
 * Shows the dish's real record — image, description, category, prep time,
 * price, availability — plus the two things the customer contributes:
 * quantity and per-item special instructions.
 *
 * Ingredients and nutrition were requested. Food stores neither, so
 * rather than printing a plausible-looking invented ingredient list under
 * a real restaurant's name, the modal shows the description the kitchen
 * actually wrote.
 *
 * `key={dish.id}` at the call site remounts this per dish, so quantity and
 * notes reset between dishes instead of leaking across.
 */
export function DishDetailModal({ dish, isOpen, onClose, onAdd, isFavorite, isPending, onToggleFavorite }) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  // Move focus into the dialog on open and lock background scroll.
  useEffect(() => {
    if (!isOpen) return undefined
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  // Escape to close, Tab cycles within the dialog.
  useEffect(() => {
    if (!isOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input, textarea, a[href]',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!dish) return null

  const image = getImageUrl(dish.imageUrl)
  const unavailable = !dish.isAvailable
  const lineTotal = Number(dish.price) * quantity

  function handleAdd() {
    onAdd(dish, quantity, notes.trim())
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close dish details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            {/* --- Image ------------------------------------------------- */}
            <div className="relative aspect-[16/10] flex-none overflow-hidden bg-canvas-2">
              {image ? (
                <img src={image} alt={dish.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
                  <UtensilsCrossed className="h-12 w-12 text-brand-200 dark:text-brand-400/50" strokeWidth={1.5} />
                </span>
              )}

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dish details"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm backdrop-blur transition-transform hover:scale-110 dark:bg-charcoal/85 dark:text-body"
              >
                <X className="h-4 w-4" />
              </button>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(dish.id)}
                  disabled={isPending}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
                  className="absolute top-3 right-14 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 disabled:opacity-60 dark:bg-charcoal/85"
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-charcoal-muted dark:text-body-muted'}`}
                  />
                </button>
              )}

              {dish.category?.name && (
                <span className="absolute bottom-3 left-4 rounded-full bg-charcoal/75 px-2.5 py-1 text-[0.65rem] font-semibold text-white backdrop-blur">
                  {dish.category.name}
                </span>
              )}
            </div>

            {/* --- Body -------------------------------------------------- */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 id="dish-modal-title" className="font-display text-2xl font-semibold text-body">
                  {dish.name}
                </h2>
                <span className="font-display text-2xl font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
                  {money(dish.price)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {dish.prepTimeMinutes && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-2 px-3 py-1 text-xs font-medium text-body-muted">
                    <Clock className="h-3.5 w-3.5" />
                    Ready in ~{dish.prepTimeMinutes} min
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    unavailable
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
                  }`}
                >
                  {unavailable ? 'Unavailable today' : 'Available now'}
                </span>
              </div>

              {dish.description && (
                <p className="mt-4 text-sm leading-relaxed text-body-muted">{dish.description}</p>
              )}

              {/* Special instructions — sent per line and surfaced to the
                  kitchen alongside the order's own instructions. */}
              <div className="mt-6 flex flex-col gap-2">
                <label htmlFor="dish-notes" className="font-display text-sm font-semibold text-body">
                  Special instructions <span className="font-sans font-normal text-body-faint">(optional)</span>
                </label>
                <textarea
                  id="dish-notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="No onions, extra sauce on the side…"
                  className="w-full resize-none rounded-xl border border-rule bg-canvas px-3.5 py-2.5 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
                />
              </div>
            </div>

            {/* --- Footer ------------------------------------------------ */}
            <div className="flex flex-none items-center gap-3 border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <div className="flex flex-none items-center gap-1 rounded-full border border-rule bg-card p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span aria-live="polite" className="w-8 text-center font-display text-base font-semibold text-body">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={unavailable}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <ShoppingBag className="h-4 w-4" />
                {unavailable ? 'Unavailable' : `Add · ${money(lineTotal)}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
