import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PasswordInput } from '@/components/PasswordInput'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import { ROUTES, getHomeRouteForRole, canAccessPath } from '@/constants'

/**
 * Login (UI-09 redesign). Validates return destination against user role
 * so unauthorized pages are never targeted, and safely falls back to each
 * user's specific role workspace.
 */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const user = await login({ email, password, rememberMe })
      const fromPath = location.state?.from?.pathname
      const fromSearch = location.state?.from?.search || ''
      const canAccessFrom = fromPath && canAccessPath(fromPath, user?.role, user)
      const redirectTo = canAccessFrom
        ? `${fromPath}${fromSearch}`
        : getHomeRouteForRole(user?.role, user)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">Welcome back</h1>
        <p className="text-sm text-body-muted">Log in to order ahead, track your table, and more.</p>
      </div>

      <AuthFormMessage variant="error" messages={errorMessage} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={LABEL}>
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-body-muted">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-rule accent-brand-700"
          />
          Remember me on this device
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/30 border-t-charcoal" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-sm text-body-muted">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400">
          Create one
        </Link>
      </p>
    </div>
  )
}
