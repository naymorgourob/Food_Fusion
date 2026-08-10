import { useState } from 'react'
import { Modal } from '@/components/dashboard/Modal'

const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE']

const EMPTY_FORM = { number: '', capacity: '', status: 'AVAILABLE', description: '' }

// The parent (TablesPage) remounts this with a fresh `key` whenever which
// table is being edited changes — same pattern as CategoryFormModal /
// MenuItemFormModal in Part 9 — so this initial state is never stale and
// no reset effect is needed.
function getInitialForm(table) {
  if (!table) return EMPTY_FORM
  return {
    number: table.number,
    capacity: table.capacity,
    status: table.status,
    description: table.description ?? '',
  }
}

export function TableFormModal({ isOpen, onClose, onSubmit, table, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(table))
  const isEditing = Boolean(table)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Table' : 'Add Table'} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.length > 0 && (
          <ul className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="table-number" className="text-sm font-medium text-ink">
              Table Number
            </label>
            <input
              id="table-number"
              type="number"
              min="1"
              step="1"
              required
              value={form.number}
              onChange={updateField('number')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="table-capacity" className="text-sm font-medium text-ink">
              Capacity
            </label>
            <input
              id="table-capacity"
              type="number"
              min="1"
              step="1"
              required
              value={form.capacity}
              onChange={updateField('capacity')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="table-status" className="text-sm font-medium text-ink">
            Status
          </label>
          <select
            id="table-status"
            value={form.status}
            onChange={updateField('status')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="table-description" className="text-sm font-medium text-ink">
            Description <span className="text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="table-description"
            rows={2}
            value={form.description}
            onChange={updateField('description')}
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
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Table'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
