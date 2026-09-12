import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Armchair, AlertCircle, Users, Hash } from 'lucide-react'
import { FIELD, LABEL, OPTIONAL } from '@/components/authFieldStyles'
import { TABLE_STATUS_CONFIG } from '@/features/tables/tableHelpers'

const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE']

const EMPTY_FORM = { number: '', capacity: '', status: 'AVAILABLE', description: '' }

// The parent (TablesPage) remounts this with a fresh `key` on every open —
// same pattern as CategoryFormModal — so initial state is never stale.
function getInitialForm(table) {
  if (!table) return EMPTY_FORM
  return {
    number: table.number,
    capacity: table.capacity,
    status: table.status,
    description: table.description ?? '',
  }
}

/**
 * Add/Edit Table (UI-08.6 redesign) — own dialog shell matching
 * CategoryFormModal's pattern from UI-08.2: animated entrance,
 * backdrop blur, gold "Save" CTA. The existing onSubmit(payload) API
 * contract and validation rules are unchanged.
 */
export function TableFormModal({ isOpen, onClose, onSubmit, table, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(table))
  const isEditing = Boolean(table)

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
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          {/* Backdrop */}
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

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-form-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <header className="flex flex-none items-center justify-between border-b border-rule px-6 py-4">
              <h2
                id="table-form-title"
                className="flex items-center gap-2.5 font-display text-lg font-semibold text-body"
              >
                <Armchair className="h-4 w-4 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
                {isEditing ? `Edit Table ${table.number}` : 'Add Table'}
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

            {/* Form */}
            <form id="table-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                {/* Error list */}
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

                {/* Number + Capacity row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="table-number" className={LABEL}>
                      <span className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-body-faint" />
                        Table Number
                      </span>
                    </label>
                    <input
                      id="table-number"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.number}
                      onChange={updateField('number')}
                      placeholder="e.g. 1"
                      className={FIELD}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="table-capacity" className={LABEL}>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-body-faint" />
                        Capacity
                      </span>
                    </label>
                    <input
                      id="table-capacity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.capacity}
                      onChange={updateField('capacity')}
                      placeholder="e.g. 4"
                      className={FIELD}
                    />
                  </div>
                </div>

                {/* Status — visual selector */}
                <div className="flex flex-col gap-2">
                  <span className={LABEL}>Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => {
                      const config = TABLE_STATUS_CONFIG[option]
                      const isSelected = form.status === option
                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all ${
                            isSelected
                              ? `${config.badgeClass} border-current`
                              : 'border-rule bg-canvas-2 text-body-muted hover:border-brand-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="table-status"
                            value={option}
                            checked={isSelected}
                            onChange={updateField('status')}
                            className="sr-only"
                          />
                          <span
                            className={`h-2 w-2 flex-none rounded-full ${config.dotClass}`}
                          />
                          <span className="text-sm font-semibold">{config.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="table-description" className={LABEL}>
                    Description <span className={OPTIONAL}>(optional)</span>
                  </label>
                  <textarea
                    id="table-description"
                    rows={2}
                    value={form.description}
                    onChange={updateField('description')}
                    placeholder="e.g. Window-side table with scenic view"
                    className={FIELD}
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
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
                form="table-form"
                disabled={isSubmitting}
                className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create table'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
