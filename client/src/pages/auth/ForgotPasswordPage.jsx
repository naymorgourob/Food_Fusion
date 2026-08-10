import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, MailCheck } from 'lucide-react'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { FIELD, LABEL } from '@/components/authFieldStyles'
import { ROUTES } from '@/constants'

/**
 * Forgot Password (UI-09).
 *
 * IMPORTANT — there is no password-reset backend. auth.routes.js exposes
 * only POST /register and POST /login; there is no
 * forgot-password/send-reset-link endpoint, no reset-token column or
 * table anywhere in the schema. This page cannot call an API that
 * doesn't exist, and UI-09 explicitly forbids adding authentication
 * logic — so it doesn't pretend to.
 *
 * What it does instead: after a brief simulated delay, it shows the
 * generic "if that email has an account, a reset link is on its way"
 * success state real password-reset flows use (which is itself correct
 * security practice — it never confirms whether the email exists), then
 * stops. No email is sent, because nothing here can send one. This is
 * the same "presentational, plainly labelled" choice made for the
 * checkout payment step and the reservation confirmation's calendar
 * button.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    // No API call — see the note above. The delay only avoids the success
    // state flashing in instantly, which would look broken rather than sent.
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/50" />
          <span className="absolute inset-2 rounded-full bg-brand-700" />
          <MailCheck className="relative h-6 w-6 text-white" />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-xl font-semibold text-body">Check your inbox</h1>
          <p className="max-w-xs text-sm leading-relaxed text-body-muted">
            If an account exists for <span className="font-medium text-body">{email}</span>, a
            password reset link is on its way.
          </p>
        </div>

        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-body sm:text-3xl">Forgot your password?</h1>
        <p className="text-sm text-body-muted">
          Enter the email on your account and we&rsquo;ll send you a link to reset it.
        </p>
      </div>

      <AuthFormMessage
        variant="info"
        messages="Password reset isn't wired up to email yet in this build — this shows what the flow will look like."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="forgot-email" className={LABEL}>
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={FIELD}
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
            <Mail className="h-4 w-4" />
          )}
          {isSubmitting ? 'Sending…' : 'Send reset link'}
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
