import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UtensilsCrossed, AlertCircle } from 'lucide-react'
import { ImageUploadField } from '@/features/menu/components/ImageUploadField'
import { FIELD, LABEL, OPTIONAL } from '@/components/authFieldStyles'

const EMPTY_FORM = {
  name: '',
  categoryId: '',
  description: '',
  price: '',
  prepTimeMinutes: '',
  isAvailable: true,
}

// The parent (MenuItemsPage) remounts this component with a fresh `key`
// whenever which item is being edited changes, so this initial state,
// read once per mount, never goes stale — no reset effect needed.
function getInitialForm(item) {
  if (!item) return EMPTY_FORM
  return {
    name: item.name,
    categoryId: item.categoryId,
    description: item.description ?? '',
    price: item.price,
    prepTimeMinutes: item.prepTimeMinutes ?? '',
    isAvailable: item.isAvailable,
  }
}

/**
 * Add/Edit Menu Item (UI-08.1 redesign) — own slide-up dialog rather than
 * the shared Modal.jsx component, matching the pattern already used for
 * DishDetailModal and StaffOrderDrawer. Modal.jsx is reused by every
 * Add/Edit form across the whole Admin Dashboard (Tables, Staff,
 * Customers, Inventory, Reservations…) — redesigning it here would have
 * silently changed every one of those, which this task doesn't
 * authorize touching.
 *
 * Fields, validation, and the onSubmit(payload, imageFile) contract are
 * all unchanged — this is presentation and interaction polish only.
 * There is no "Featured" field: Food has no isFeatured column (see the
 * design note on MenuItemsPage.jsx).
 */
export function MenuItemFormModal({ isOpen, onClose, onSubmit, item, categories, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(item))
  const [imageFile, setImageFile] = useState(null)
  const isEditing = Boolean(item)

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
    onSubmit(form, imageFile)
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
            aria-labelledby="menu-item-form-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            <header className="flex flex-none items-center justify-between border-b border-rule px-6 py-4">
              <h2 id="menu-item-form-title" className="flex items-center gap-2.5 font-display text-lg font-semibold text-body">
                <UtensilsCrossed className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                {isEditing ? 'Edit menu item' : 'Add menu item'}
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

            <form id="menu-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
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

                <ImageUploadField existingImageUrl={item?.imageUrl} onFileSelected={setImageFile} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="food-name" className={LABEL}>
                      Name
                    </label>
                    <input
                      id="food-name"
                      required
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Truffle Tagliatelle"
                      className={FIELD}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="food-category" className={LABEL}>
                      Category
                    </label>
                    <select
                      id="food-category"
                      required
                      value={form.categoryId}
                      onChange={updateField('categoryId')}
                      className={FIELD}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="food-price" className={LABEL}>
                      Price
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-body-faint">
                        $
                      </span>
                      <input
                        id="food-price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={form.price}
                        onChange={updateField('price')}
                        placeholder="0.00"
                        className={`${FIELD} pl-7`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="food-prep-time" className={LABEL}>
                      Prep time (minutes) <span className={OPTIONAL}>(optional)</span>
                    </label>
                    <input
                      id="food-prep-time"
                      type="number"
                      step="1"
                      min="1"
                      value={form.prepTimeMinutes}
                      onChange={updateField('prepTimeMinutes')}
                      placeholder="e.g. 20"
                      className={FIELD}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="food-description" className={LABEL}>
                    Description <span className={OPTIONAL}>(optional)</span>
                  </label>
                  <textarea
                    id="food-description"
                    rows={3}
                    value={form.description}
                    onChange={updateField('description')}
                    placeholder="A short, appetising line for the menu."
                    className={FIELD}
                  />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-rule bg-canvas-2 px-4 py-3">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-body">Available for order</span>
                    <span className="text-xs text-body-faint">Customers can order this dish right now.</span>
                  </span>
                  <span className="relative inline-flex h-6 w-11 flex-none items-center">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={updateField('isAvailable')}
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
                form="menu-item-form"
                disabled={isSubmitting}
                className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create item'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
