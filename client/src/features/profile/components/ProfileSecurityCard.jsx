import { ShieldCheck, CircleCheck, CircleSlash, KeyRound } from 'lucide-react'

/**
 * Security summary (UI-09) — every row is a real column.
 *
 * "Last Login" and "Active Sessions" were requested but there is no
 * login-history or session table anywhere in the schema — JWTs here are
 * stateless, so there is no session record to list and no login-event
 * timestamp to show. GET /profile/me's PUBLIC_USER_FIELDS doesn't even
 * select `updatedAt`, so there isn't a "last changed" proxy available
 * either. Rather than surface a made-up date, this card shows the one
 * thing that is genuinely true here: account status, plus a direct link
 * to the one real security action available — changing your password.
 */
export function ProfileSecurityCard({ user }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand-700 dark:text-brand-400" />
        <h2 className="font-display text-lg font-semibold text-body">Security</h2>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-body-muted">
          {user.isActive ? (
            <CircleCheck className="h-4 w-4 text-brand-700 dark:text-brand-400" />
          ) : (
            <CircleSlash className="h-4 w-4 text-red-500" />
          )}
          Account status
        </span>
        <span
          className={`font-semibold ${user.isActive ? 'text-brand-700 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {user.isActive ? 'Active' : 'Deactivated'}
        </span>
      </div>

      <a
        href="#change-password"
        className="flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Change your password
      </a>
    </div>
  )
}
