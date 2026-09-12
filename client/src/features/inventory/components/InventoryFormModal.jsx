import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Layers, Scale, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import {
  UNIT_OPTIONS,
  UNIT_FULL_NAMES,
  COMMON_CATEGORIES,
  computeStockStatus,
  INVENTORY_STATUS_CONFIG,
} from '@/features/inventory/inventoryHelpers'

const EMPTY_FORM = {
  itemName: '',
  category: '',
  unit: 'KG',
  quantity: '',
  minStockLevel: '',
}

function getInitialForm(item) {
  if (!item) return EMPTY_FORM
  return {
    itemName: item.itemName ?? '',
    category: item.category ?? '',
    unit: item.unit ?? 'KG',
    quantity: item.quantity !== undefined ? String(item.quantity) : '',
    minStockLevel: item.minStockLevel !== undefined ? String(item.minStockLevel) : '',
  }
}

export function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  isSubmitting,
  errors = [],
}) {
  const [form, setForm] = useState(() => getInitialForm(item))
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
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSelectCategory(cat) {
    setForm((current) => ({ ...current, category: cat }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      itemName: form.itemName.trim(),
      category: form.category.trim(),
      unit: form.unit,
      quantity: Number(form.quantity),
      minStockLevel: Number(form.minStockLevel),
    })
  }

  // Live preview of the computed stock status
  const previewStatus =
    form.quantity !== '' && form.minStockLevel !== ''
      ? computeStockStatus(form.quantity, form.minStockLevel)
      : null
  const statusConfig = previewStatus ? INVENTORY_STATUS_CONFIG[previewStatus] : null

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

          {/* Modal dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative flex w-full max-w-lg flex-col rounded-t-3xl border border-rule bg-card shadow-2xl sm:rounded-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rule px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
                  <Package className="h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <h2 id="inventory-modal-title" className="font-display text-lg font-bold text-body">
                    {isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}
                  </h2>
                  <p className="text-xs text-body-muted">
                    {isEditing
                      ? 'Adjust quantity, measurement unit, or restock threshold'
                      : 'Add a new restaurant ingredient or consumable item'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6 gap-4">
              {errors.length > 0 && (
                <div className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="h-4 w-4 flex-none" />
                    <span>Please fix the following:</span>
                  </div>
                  <ul className="list-disc pl-5">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Item Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inventory-name" className={LABEL}>
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  id="inventory-name"
                  type="text"
                  required
                  placeholder="e.g. Angus Beef Ribeye"
                  value={form.itemName}
                  onChange={updateField('itemName')}
                  className={FIELD}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inventory-category" className={LABEL}>
                  Category <span className="text-danger">*</span>
                </label>
                <input
                  id="inventory-category"
                  type="text"
                  required
                  placeholder="e.g. Meat, Seafood, Produce"
                  value={form.category}
                  onChange={updateField('category')}
                  className={FIELD}
                />

                {/* Quick select category chips */}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {COMMON_CATEGORIES.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        form.category.toLowerCase() === cat.toLowerCase()
                          ? 'bg-brand-700 text-white dark:bg-brand-600'
                          : 'border border-rule bg-canvas text-body-muted hover:border-brand-300 hover:text-body'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity, Unit & Threshold */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inventory-quantity" className={LABEL}>
                    Current Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    id="inventory-quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0"
                    value={form.quantity}
                    onChange={updateField('quantity')}
                    className={FIELD}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inventory-unit" className={LABEL}>
                    Measurement Unit <span className="text-danger">*</span>
                  </label>
                  <select
                    id="inventory-unit"
                    value={form.unit}
                    onChange={updateField('unit')}
                    className={FIELD}
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {UNIT_FULL_NAMES[opt]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="inventory-min-stock" className={LABEL}>
                  Minimum Stock Threshold <span className="text-danger">*</span>
                </label>
                <input
                  id="inventory-min-stock"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Threshold for low-stock warnings"
                  value={form.minStockLevel}
                  onChange={updateField('minStockLevel')}
                  className={FIELD}
                />
                <span className="text-[11px] text-body-faint">
                  When current quantity drops below this number, the item triggers a Low Stock alert.
                </span>
              </div>

              {/* Live Preview of Projected Status */}
              {statusConfig && (
                <div className="flex items-center justify-between rounded-xl border border-rule bg-canvas p-3 text-xs">
                  <span className="font-medium text-body-muted">Calculated Status Preview:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-rule pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-rule px-4 py-2.5 text-xs font-semibold text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-xs font-bold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? isEditing
                      ? 'Saving changes…'
                      : 'Adding item…'
                    : isEditing
                    ? 'Save Changes'
                    : 'Add Inventory Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
