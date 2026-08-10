import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { PasswordInput } from '@/components/PasswordInput'
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { LABEL } from '@/components/authFieldStyles'
import { ROUTES } from '@/constants'

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

/**
 * Reset Password (UI-09).
 *
 * IMPORTANT — presentational only, same as ForgotPasswordPage: there is
 * no reset-token backend to validate against, so there is nothing this
 * form could actually submit to. Real client-side validation still runs
 * (the exact PASSWORD_REGEX from auth.validator.js / profile.validator.js,
 * plus the confirm-password match), because that part genuinely works
 * without a server — it's the final "reset" action that has nowhere to
 * go, and the button says so.
 *
 * If a real reset-token flow is added later, this page becomes real by
 * reading the token from the URL and wiring the submit handler to the new
 * endpoint — nothing about the form itself would need to change.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const messages = []
    if (!PASSWORD_REGEX.test(password)) {
      messages.push('Password must be at least 8 characters and include a letter and a number.')
    }
    if (password !== confirmPassword) {
      messages.push('Passwords do not match.')
    }
    return messages
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSubmitting(false)
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">Choose a new password</h1>
        <p className="text-sm text-body-muted">Make it something you haven&rsquo;t used before.</p>
      </div>

      <AuthFormMessage
        variant="info"
        messages="Password reset isn't wired up to a real reset link yet in this build — this shows what the flow will look like once it is."
      />
      <AuthFormMessage variant="error" messages={errors} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className={LABEL}>
            New password
          </label>
          <PasswordInput
            id="new-password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters, with a letter and a number"
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-new-password" className={LABEL}>
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-new-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            hasError={Boolean(confirmPassword) && confirmPassword !== password}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/30 border-t-charcoal" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <Link
        to={ROUTES.LOGIN}
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-body-muted transition-colors hover:text-brand-700 dark:hover:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  )
}
