import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2, UtensilsCrossed, CalendarDays, ListOrdered } from 'lucide-react'

/**
 * Read-only category details (UI-08.2) — opened by clicking a category's
 * icon or "View details" in the grid.
 *
 * Every field is a genuine column or computed value: name, description,
 * itemCount (from listCategories' _count.foods), createdAt, isActive.
 * No image: Category has no imageUrl column (see the design note on
 * AdminCategoryCard.jsx).
 */
export function AdminCategoryDetailModal({ category, isOpen, onClose, onEdit, onDelete }) {
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

  if (!category) return null

  const inactive = !category.isActive

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close category details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-detail-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            <div className="relative flex flex-none flex-col items-center gap-3 bg-gradient-to-br from-brand-50 to-canvas-2 px-6 pt-8 pb-6 text-center dark:from-brand-900/40 dark:to-canvas-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close category details"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm backdrop-blur transition-transform hover:scale-110 dark:bg-charcoal/85 dark:text-body"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-brand-700 shadow-sm dark:text-brand-400">
                <UtensilsCrossed className="h-7 w-7" strokeWidth={1.5} />
              </span>

              <h2 id="category-detail-title" className="font-display text-xl font-semibold text-body">
                {category.name}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  inactive
                    ? 'bg-canvas-2 text-body-faint'
                    : 'bg-brand-700 text-white'
                }`}
              >
                {inactive ? 'Inactive' : 'Active'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {category.description ? (
                <p className="text-sm leading-relaxed text-body-muted">{category.description}</p>
              ) : (
                <p className="text-sm text-body-faint italic">No description added yet.</p>
              )}

              <dl className="mt-5 flex flex-col gap-3 border-t border-rule pt-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-body-muted">
                    <ListOrdered className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                    Total dishes
                  </dt>
                  <dd className="font-semibold text-body">{category.itemCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-body-muted">
                    <CalendarDays className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                    Created
                  </dt>
                  <dd className="text-body">
                    {new Date(category.createdAt).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            <footer className="flex flex-none items-center gap-3 border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <button
                type="button"
                onClick={() => onEdit(category)}
                className="ml-auto flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
              >
                <Pencil className="h-4 w-4" />
                Edit category
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
