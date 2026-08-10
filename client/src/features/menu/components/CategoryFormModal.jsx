import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, AlertCircle } from 'lucide-react'
import { FIELD, LABEL, OPTIONAL } from '@/components/authFieldStyles'

const EMPTY_FORM = { name: '', description: '', isActive: true }

// The parent (CategoriesPage) remounts this component with a fresh `key`
// whenever which category is being edited changes, so this initial
// state, read once per mount, never goes stale — no reset effect needed.
function getInitialForm(category) {
  if (!category) return EMPTY_FORM
  return { name: category.name, description: category.description ?? '', isActive: category.isActive }
}

/**
 * Add/Edit Category (UI-08.2 redesign) — own dialog shell, matching
 * MenuItemFormModal's pattern from UI-08.1, rather than the shared
 * Modal.jsx component. Modal.jsx is reused by every Add/Edit form across
 * the whole Admin Dashboard (Tables, Staff, Customers, Inventory,
 * Reservations…) — redesigning it here would have silently restyled
 * every one of those.
 *
 * Fields, validation, and the onSubmit(payload) contract are unchanged.
 * There is no image field: Category has no imageUrl column anywhere in
 * the schema (see the design note on AdminCategoryCard.jsx).
 */
export function CategoryFormModal({ isOpen, onClose, onSubmit, category, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(category))
  const isEditing = Boolean(category)

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

  function updateField(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setForm((current) => ({ ...current, [field]: value }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            <header className="flex flex-none items-center justify-between border-b border-rule px-6 py-4">
              <h2 id="category-form-title" className="flex items-center gap-2.5 font-display text-lg font-semibold text-body">
                <Tag className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                {isEditing ? 'Edit category' : 'Add category'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form id="category-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                {errors.length > 0 && (
                  <ul
                    role="alert"
                    className="flex flex-col gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
                  >
                    {errors.map((message) => (
                      <li key={message} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                        {message}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category-name" className={LABEL}>
                    Name
                  </label>
                  <input
                    id="category-name"
                    required
                    value={form.name}
                    onChange={updateField('name')}
                    placeholder="e.g. Desserts"
                    className={FIELD}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category-description" className={LABEL}>
                    Description <span className={OPTIONAL}>(optional)</span>
                  </label>
                  <textarea
                    id="category-description"
                    rows={3}
                    value={form.description}
                    onChange={updateField('description')}
                    placeholder="A short line describing this part of the menu."
                    className={FIELD}
                  />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-rule bg-canvas-2 px-4 py-3">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-body">Active</span>
                    <span className="text-xs text-body-faint">
                      Inactive categories stay on the menu but are hidden from customers browsing by status.
                    </span>
                  </span>
                  <span className="relative inline-flex h-6 w-11 flex-none items-center">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={updateField('isActive')}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-canvas transition-colors peer-checked:bg-brand-700" />
                    <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>
            </form>

            <footer className="flex flex-none items-center justify-end gap-3 border-t border-rule bg-canvas/60 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-form"
                disabled={isSubmitting}
                className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create category'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
