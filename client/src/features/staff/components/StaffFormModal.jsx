import { useState } from 'react'
import { Modal } from '@/components/dashboard/Modal'
import { PasswordInput } from '@/components/PasswordInput'

const EMPTY_FORM = { fullName: '', email: '', phone: '', position: '', password: '' }

// The parent (StaffPage) remounts this with a fresh `key` whenever which
// staff member is being edited changes — same pattern as
// TableFormModal/CategoryFormModal — so this initial state is never stale.
function getInitialForm(staffMember) {
  if (!staffMember) return EMPTY_FORM
  return {
    fullName: staffMember.fullName,
    email: staffMember.email,
    phone: staffMember.phone,
    position: staffMember.position ?? '',
    password: '',
  }
}

export function StaffFormModal({ isOpen, onClose, onSubmit, staffMember, isSubmitting, errors }) {
  const [form, setForm] = useState(() => getInitialForm(staffMember))
  const isEditing = Boolean(staffMember)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // Editing never sends a password — this form is profile details only,
    // not a "reset password" flow (see staff.validator.js/updateStaff).
    const { fullName, email, phone, position } = form
    onSubmit(isEditing ? { fullName, email, phone, position } : form)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Staff' : 'Add Staff'} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.length > 0 && (
          <ul className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="staff-name" className="text-sm font-medium text-ink">
            Full Name
          </label>
          <input
            id="staff-name"
            required
            value={form.fullName}
            onChange={updateField('fullName')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="staff-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="staff-email"
            type="email"
            required
            value={form.email}
            onChange={updateField('email')}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="staff-phone" className="text-sm font-medium text-ink">
              Phone
            </label>
            <input
              id="staff-phone"
              required
              value={form.phone}
              onChange={updateField('phone')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="staff-position" className="text-sm font-medium text-ink">
              Position
            </label>
            <input
              id="staff-position"
              required
              placeholder="e.g. Waiter, Chef"
              value={form.position}
              onChange={updateField('position')}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>
        </div>

        {!isEditing && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="staff-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <PasswordInput
              id="staff-password"
              name="password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="new-password"
            />
          </div>
        )}

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
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
