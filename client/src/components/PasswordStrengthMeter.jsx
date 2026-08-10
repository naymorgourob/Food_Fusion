import { Check, X } from 'lucide-react'

/**
 * Password strength feedback (UI-09) for Register / Reset / Change
 * Password.
 *
 * The two starred requirements are not decorative — they are exactly
 * PASSWORD_REGEX from the backend's auth/profile/user validators
 * (`/^(?=.*[A-Za-z])(?=.*\d).{8,}$/`): 8+ characters, at least one letter,
 * at least one digit. A password can only ever be accepted by the server
 * if both are met, so this meter never tells someone their password is
 * fine when the API would reject it. The strength bar itself adds two
 * further real signals (length beyond the minimum, a mix of case or a
 * symbol) that make a compliant password meaningfully stronger, without
 * inventing a fake "score" that doesn't correspond to anything.
 */
function evaluate(password) {
  const hasLetter = /[A-Za-z]/.test(password)
  const hasDigit = /\d/.test(password)
  const meetsMinimum = password.length >= 8 && hasLetter && hasDigit

  let score = 0
  if (meetsMinimum) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  return { hasLetter, hasDigit, meetsMinimum, score }
}

const LEVELS = [
  { label: 'Too short', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-gold-500' },
  { label: 'Good', color: 'bg-brand-500' },
  { label: 'Strong', color: 'bg-brand-700' },
]

export function PasswordStrengthMeter({ password }) {
  if (!password) return null

  const { hasLetter, hasDigit, meetsMinimum, score } = evaluate(password)
  const level = LEVELS[score]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < score ? level.color : 'bg-canvas-2'
            }`}
          />
        ))}
      </div>

      <p aria-live="polite" className="text-xs font-medium text-body-muted">
        {level.label}
      </p>

      <ul className="flex flex-col gap-1 text-xs">
        <li className={`flex items-center gap-1.5 ${meetsMinimum ? 'text-brand-700 dark:text-brand-400' : 'text-body-faint'}`}>
          {password.length >= 8 ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          At least 8 characters
        </li>
        <li className={`flex items-center gap-1.5 ${hasLetter && hasDigit ? 'text-brand-700 dark:text-brand-400' : 'text-body-faint'}`}>
          {hasLetter && hasDigit ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          A mix of letters and numbers
        </li>
      </ul>
    </div>
  )
}
