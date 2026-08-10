import { getImageUrl } from '@/constants'
import { User, BadgeCheck } from 'lucide-react'

const ROLE_LABEL = { ADMIN: 'Administrator', STAFF: 'Staff', CUSTOMER: 'Customer' }

function memberSince(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'long', year: 'numeric' })
}

/**
 * Profile page header (UI-09) — photo, name, role badge, and the one
 * genuinely available join-date fact. Address was requested but User has
 * no address column, so it's not shown here rather than an empty "—" row
 * pretending to be a field.
 */
export function ProfileHero({ user }) {
  const image = getImageUrl(user.profileImage)

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-rule bg-card p-6 text-center sm:flex-row sm:items-center sm:text-left">
      <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-full border-2 border-rule bg-canvas-2">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-body-faint" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="font-display text-xl font-semibold text-body sm:text-2xl">{user.fullName}</h1>
        <p className="text-sm text-body-muted">{user.email}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
            <BadgeCheck className="h-3.5 w-3.5" />
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
          <span className="text-xs text-body-faint">Member since {memberSince(user.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
