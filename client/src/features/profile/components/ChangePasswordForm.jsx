import { useState } from 'react'
import { PasswordInput } from '@/components/PasswordInput'
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { LABEL } from '@/components/authFieldStyles'

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }

/**
 * Shared password-change form (UI-09 restyle) — same reuse as
 * EditProfileForm, across Customer/Admin/Staff profile pages.
 *
 * onSubmit resolves to true/false (success or not) so this form only
 * clears itself — current password included — after the change actually
 * went through, never after a rejected attempt.
 */
export function ChangePasswordForm({ onSubmit, isSubmitting, errors, successMessage }) {
  const [form, setForm] = useState(EMPTY_FORM)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const succeeded = await onSubmit(form)
    if (succeeded) setForm(EMPTY_FORM)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-rule bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">Change password</h2>
        <p className="text-sm text-body-muted">Use something you don&rsquo;t use anywhere else.</p>
      </div>

      <AuthFormMessage variant="success" messages={successMessage} />
      <AuthFormMessage variant="error" messages={errors} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="current-password" className={LABEL}>
          Current password
        </label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={updateField('currentPassword')}
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className={LABEL}>
          New password
        </label>
        <PasswordInput
          id="new-password"
          name="newPassword"
          value={form.newPassword}
          onChange={updateField('newPassword')}
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={form.newPassword} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className={LABEL}>
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          autoComplete="new-password"
          hasError={Boolean(form.confirmPassword) && form.confirmPassword !== form.newPassword}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Updating…' : 'Change password'}
      </button>
    </form>
  )
}
