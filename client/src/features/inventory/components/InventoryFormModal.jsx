import { useState } from 'react'
import { Modal } from '@/components/dashboard/Modal'

const UNIT_OPTIONS = ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK']

const UNIT_LABELS = {
  KG: 'Kg',
  GRAM: 'Gram',
  LITER: 'Liter',
  ML: 'Ml',
  PIECE: 'Piece',
  BOX: 'Box',
  PACK: 'Pack',
}

const EMPTY_FORM = { itemName: '', category: '', unit: 'KG', quantity: '', minStockLevel: '' }

// The parent (InventoryPage) remounts this with a fresh `key` whenever
// which item is being edited changes — same pattern as
// TableFormModal/CategoryFormModal — so this initial state is never stale.
function getInitialForm(item) {
  if (!item) return EMPTY_FORM
  return {
    itemName: item.itemName,
    category: item.category,
    unit: item.unit,
    quantity: item.quantity,
    minStockLevel: item.minStockLevel,
  }
}

export function InventoryFormModal({ isOpen, onClose, onSubmit, item, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(item))
  const isEditing = Boolean(item)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.length > 0 && (
          <ul className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inventory-name" className="text-sm font-medium text-ink">
            Item Name
          </label>
          <input
            id="inventory-name"
            required
            value={form.itemName}
            onChange={updateField('itemName')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inventory-category" className="text-sm font-medium text-ink">
            Category
          </label>
          <input
            id="inventory-category"
            required
            placeholder="e.g. Vegetables, Dairy, Meat"
            value={form.category}
            onChange={updateField('category')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="inventory-quantity" className="text-sm font-medium text-ink">
              Quantity
            </label>
            <input
              id="inventory-quantity"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.quantity}
              onChange={updateField('quantity')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="inventory-unit" className="text-sm font-medium text-ink">
              Unit
            </label>
            <select
              id="inventory-unit"
              value={form.unit}
              onChange={updateField('unit')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {UNIT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inventory-min-stock" className="text-sm font-medium text-ink">
            Minimum Stock Level
          </label>
          <input
            id="inventory-min-stock"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.minStockLevel}
            onChange={updateField('minStockLevel')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
