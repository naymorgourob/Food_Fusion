import { useState } from 'react'
import { AvatarUploadField } from '@/features/profile/components/AvatarUploadField'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { FIELD, DISABLED_FIELD, LABEL } from '@/components/authFieldStyles'

/**
 * Shared "edit your own details" form (UI-09 restyle) — reused verbatim
 * by MyProfilePage (Customer), and dashboard/profile/ProfilePage (Admin
 * and Staff, via UI-07's Staff workspace). Redesigning it here updates
 * all three at once, which is the whole point of one shared component.
 *
 * Lives directly on the page (not a modal reopened repeatedly), so a
 * plain lazy useState from the `user` prop is enough — no remount-key
 * pattern needed. Email and Role are shown but not editable — see
 * profile.validator.js on the backend for why email specifically stays
 * fixed.
 */
export function EditProfileForm({ user, onSubmit, isSubmitting, errors, successMessage }) {
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone })
  const [imageFile, setImageFile] = useState(null)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-rule bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-body">Personal informations</h2>
        <p className="text-sm text-body-muted">Your name and contact details.</p>
      </div>

      <AuthFormMessage variant="success" messages={successMessage} />
      <AuthFormMessage variant="error" messages={errors} />

      <AvatarUploadField existingImageUrl={user.profileImage} onFileSelected={setImageFile} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className={LABEL}>
            Full name
          </label>
          <input id="profile-name" required value={form.fullName} onChange={updateField('fullName')} className={FIELD} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-phone" className={LABEL}>
            Phone
          </label>
          <input id="profile-phone" required value={form.phone} onChange={updateField('phone')} className={FIELD} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-email" className={LABEL}>
            Email
          </label>
          <input id="profile-email" value={user.email} disabled className={DISABLED_FIELD} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-role" className={LABEL}>
            Role
          </label>
          <input
            id="profile-role"
            value={user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            disabled
            className={DISABLED_FIELD}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
