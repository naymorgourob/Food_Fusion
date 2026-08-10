import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PasswordInput } from '@/components/PasswordInput'
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import { ROUTES } from '@/constants'

const INITIAL_FORM = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }

/**
 * Register (UI-09 redesign). Submission logic is unchanged — same
 * register() call, same "public registration always creates a CUSTOMER"
 * fact from auth.service.js, same redirect to /account on success.
 *
 * The Terms checkbox is new and is a client-side gate only: there is no
 * terms-acceptance column on User and nothing is sent to the API about
 * it — it just has to be checked before the button is enabled, the same
 * way any other required field would.
 */
export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [successMessage, setSuccessMessage] = useState('')

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    // Checked client-side for instant feedback — the backend re-validates
    // everything regardless, since it can never trust the client alone.
    if (form.password !== form.confirmPassword) {
      setErrors(['Passwords do not match.'])
      return
    }

    setIsSubmitting(true)
    try {
      await register(form)
      // Public registration always creates a CUSTOMER (see server/src/services/auth.service.js) —
      // never Admin, so there's no role branch to consider here.
      setSuccessMessage('Account created! Taking you to your account…')
      setTimeout(() => navigate(ROUTES.ACCOUNT, { replace: true }), 900)
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">Create your account</h1>
        <p className="text-sm text-body-muted">Join FoodFusion to order ahead and track your visits.</p>
      </div>

      <AuthFormMessage variant="success" messages={successMessage} />
      <AuthFormMessage variant="error" messages={errors} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className={LABEL}>
            Full name
          </label>
          <input
            id="fullName"
            required
            autoComplete="name"
            value={form.fullName}
            onChange={updateField('fullName')}
            placeholder="Priya Nair"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="you@example.com"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={LABEL}>
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={updateField('phone')}
            placeholder="+1 555-010-2231"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={LABEL}>
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder="At least 8 characters, with a letter and a number"
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className={LABEL}>
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            hasError={Boolean(form.confirmPassword) && form.confirmPassword !== form.password}
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-body-muted">
          <input
            type="checkbox"
            required
            checked={agreedToTerms}
            onChange={(event) => setAgreedToTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none rounded border-rule accent-brand-700"
          />
          I agree to FoodFusion&rsquo;s Terms of Service and Privacy Policy.
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !agreedToTerms}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/30 border-t-charcoal" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-body-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400">
          Log in
        </Link>
      </p>
    </div>
  )
}
