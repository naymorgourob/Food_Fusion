import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useClickOutside } from '@/hooks/useClickOutside'
import { ROUTES, USER_ROLES, getImageUrl } from '@/constants'

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  function handleLogout() {
    setOpen(false)
    logout()
    navigate(ROUTES.HOME, { replace: true })
  }

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?'
  const avatarUrl = getImageUrl(user?.profileImage)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-surface-2"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-600 text-sm font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="hidden text-sm font-medium text-ink sm:inline">{user?.fullName}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          {/* Settings is Admin-only (Part 17) — Staff also sees this
              dropdown (it's part of DashboardLayout's TopNav, which Staff
              reaches via /dashboard/orders and /dashboard/billing), so the
              link itself has to be hidden rather than just gated by the route. */}
          {user?.role === USER_ROLES.ADMIN && (
            <Link
              to="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  )
}
