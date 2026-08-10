import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Pencil, Trash2, UtensilsCrossed, Tag } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'

/**
 * Read-only food details (UI-08.1) — a large-image quick view for the
 * admin grid, opened by clicking a dish's photo.
 *
 * Every field is a genuine Food column: image, name, description,
 * category, price, prep time, availability. There is no "Featured
 * Status" row here, because Food has no isFeatured column (see the
 * design note on MenuItemsPage.jsx) — showing a fake toggle state would
 * misrepresent data that doesn't exist.
 */
export function AdminDishDetailModal({ dish, isOpen, onClose, onEdit, onDelete }) {
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

  if (!dish) return null

  const image = getImageUrl(dish.imageUrl)
  const unavailable = !dish.isAvailable

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dish-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            <div className="relative aspect-[16/10] flex-none overflow-hidden bg-canvas-2">
              {image ? (
                <img src={image} alt={dish.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
                  <UtensilsCrossed className="h-12 w-12 text-brand-200 dark:text-brand-400/50" strokeWidth={1.5} />
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dish details"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm backdrop-blur transition-transform hover:scale-110 dark:bg-charcoal/85 dark:text-body"
              >
                <X className="h-4 w-4" />
              </button>

              {dish.category?.name && (
                <span className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-charcoal/75 px-2.5 py-1 text-[0.65rem] font-semibold text-white backdrop-blur">
                  <Tag className="h-3 w-3" />
                  {dish.category.name}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 id="admin-dish-modal-title" className="font-display text-2xl font-semibold text-body">
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
                  {unavailable ? 'Unavailable to customers' : 'Available to customers'}
                </span>
              </div>

              {dish.description ? (
                <p className="mt-4 text-sm leading-relaxed text-body-muted">{dish.description}</p>
              ) : (
                <p className="mt-4 text-sm text-body-faint italic">No description added yet.</p>
              )}
            </div>

            <footer className="flex flex-none items-center gap-3 border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <button
                type="button"
                onClick={() => onDelete(dish)}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <button
                type="button"
                onClick={() => onEdit(dish)}
                className="ml-auto flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
              >
                <Pencil className="h-4 w-4" />
                Edit dish
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
