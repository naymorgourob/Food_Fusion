import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Briefcase, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { PasswordInput } from '@/components/PasswordInput'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import { COMMON_POSITIONS } from '@/features/staff/staffHelpers'

const EMPTY_FORM = { fullName: '', email: '', phone: '', position: '', password: '' }

function getInitialForm(staffMember) {
  if (!staffMember) return EMPTY_FORM
  return {
    fullName: staffMember.fullName ?? '',
    email: staffMember.email ?? '',
    phone: staffMember.phone ?? '',
    position: staffMember.position ?? '',
    password: '',
  }
}

export function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  staffMember,
  isSubmitting,
  errors = [],
}) {
  const [form, setForm] = useState(() => getInitialForm(staffMember))
  const isEditing = Boolean(staffMember)

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

  function handleSelectPosition(position) {
    setForm((current) => ({ ...current, position }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const { fullName, email, phone, position, password } = form
    onSubmit(
      isEditing
        ? { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), position: position.trim() }
        : { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), position: position.trim(), password }
    )
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

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-form-title"
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
                  <User className="h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <h2 id="staff-form-title" className="font-display text-lg font-bold text-body">
                    {isEditing ? 'Edit Staff Profile' : 'Add New Staff Member'}
                  </h2>
                  <p className="text-xs text-body-muted">
                    {isEditing
                      ? 'Update contact info and job position'
                      : 'Create a new employee account with role access'}
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

            {/* Form content */}
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

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="staff-name" className={LABEL}>
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
                  <input
                    id="staff-name"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={updateField('fullName')}
                    placeholder="e.g. Marcus Vance"
                    className={`${FIELD} pl-10`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="staff-email" className={LABEL}>
                  Work Email <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
                  <input
                    id="staff-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="marcus@foodfusion.com"
                    className={`${FIELD} pl-10`}
                  />
                </div>
              </div>

              {/* Phone & Position */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staff-phone" className={LABEL}>
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
                    <input
                      id="staff-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={updateField('phone')}
                      placeholder="+1 555-0199"
                      className={`${FIELD} pl-10`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staff-position" className={LABEL}>
                    Job Position <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
                    <input
                      id="staff-position"
                      type="text"
                      required
                      value={form.position}
                      onChange={updateField('position')}
                      placeholder="e.g. Head Chef"
                      className={`${FIELD} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Quick suggestions for position */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-medium text-body-muted">
                  <Sparkles className="h-3 w-3 text-gold-500" /> Quick positions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_POSITIONS.slice(0, 6).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handleSelectPosition(pos)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        form.position === pos
                          ? 'bg-brand-700 text-white dark:bg-brand-600'
                          : 'border border-rule bg-canvas text-body-muted hover:border-brand-300 hover:text-body'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password (for new staff only) */}
              {!isEditing && (
                <div className="flex flex-col gap-1.5 border-t border-rule pt-3">
                  <label htmlFor="staff-password" className={LABEL}>
                    Initial Password <span className="text-danger">*</span>
                  </label>
                  <PasswordInput
                    id="staff-password"
                    name="password"
                    value={form.password}
                    onChange={updateField('password')}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters with letter & number"
                  />
                  <span className="text-[11px] text-body-faint">
                    Password must be at least 8 characters and include a letter and a number.
                  </span>
                </div>
              )}

              {/* Actions */}
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
                      : 'Creating account…'
                    : isEditing
                    ? 'Save Changes'
                    : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
