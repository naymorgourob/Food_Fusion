import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const VARIANTS = {
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300',
  },
  success: {
    icon: CheckCircle2,
    className:
      'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100',
  },
  info: {
    icon: Info,
    className:
      'border-gold-300 bg-gold-100/60 text-charcoal dark:border-gold-700 dark:bg-gold-100/10 dark:text-body',
  },
}

/**
 * One inline validation banner, shared by every auth and profile form
 * (UI-09) — Login, Register, Forgot/Reset Password, Edit Profile, Change
 * Password all previously drew their own success/error block with a
 * slightly different shade each time.
 *
 * `messages` accepts a single string or an array — several forms
 * (Register, Change Password) surface multiple validator errors at once.
 */
export function AuthFormMessage({ variant = 'error', messages }) {
  const list = Array.isArray(messages) ? messages : messages ? [messages] : []
  if (list.length === 0) return null

  const { icon: Icon, className } = VARIANTS[variant]

  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${className}`}>
      <ul className="flex flex-col gap-1.5">
        {list.map((message) => (
          <li key={message} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 flex-none" />
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}
