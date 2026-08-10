import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FIELD, FIELD_ERROR } from '@/components/authFieldStyles'

/**
 * A password <input> with a show/hide toggle (UI-09 restyle).
 *
 * Shared by Login, Register, Reset Password, and Change Password — one
 * definition, so the show/hide behaviour and styling can never drift
 * between them. `hasError` swaps the border to red without duplicating
 * the whole class string at each call site.
 */
export function PasswordInput({ id, name, value, onChange, placeholder, autoComplete, hasError = false }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={hasError || undefined}
        className={`${hasError ? FIELD_ERROR : FIELD} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-body-faint transition-colors hover:text-body-muted"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
