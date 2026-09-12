import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, UserRound, LogOut, Circle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useClickOutside } from '@/hooks/useClickOutside'
import { ROUTES } from '@/constants'

function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Staff's top bar (UI-07): search, notifications, and profile, matching
 * CustomerTopBar's structure so the app feels consistent across roles.
 *
 * The spec asked for a "Shift Status" indicator. There is no shift or
 * clock-in model anywhere in the schema — Staff is just a User row with a
 * position string — so a shift *state* (on break, clocked in at 14:02,
 * etc.) can't be shown honestly. What's shown instead is the one thing
 * that's actually true right now: this account is signed in and active.
 * A fabricated "On Shift · 3h 12m" would be the kind of decorative-data
 * problem flagged throughout this project.
 */
import { isChefPosition } from '@/utils/staffWorkspace'

export function StaffTopBar({ onOpenMobileSidebar, notifications = [], workspace }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(profileRef, () => setProfileOpen(false))

  const currentWorkspace = workspace || (isChefPosition(user?.position) ? 'chef' : 'waiter')
  const searchBase = currentWorkspace === 'chef' ? ROUTES.CHEF_ORDERS : ROUTES.WAITER_ORDERS
  const profileRoute = currentWorkspace === 'chef' ? ROUTES.CHEF_PROFILE : ROUTES.WAITER_PROFILE

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? '?'

  function handleSearch(event) {
    event.preventDefault()
    // Orders is where an order number or customer name actually resolves
    // to something — no separate search index exists.
    navigate(`${searchBase}${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  function handleLogout() {
    setProfileOpen(false)
    logout()
    navigate(ROUTES.HOME, { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-canvas/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open menu"
          className="rounded-lg p-2 text-body-muted transition-colors hover:bg-canvas-2 hover:text-body lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-col lg:flex">
          <span className="truncate font-display text-base font-semibold text-body">
            {greetingFor()}, {firstName}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-body-faint">
            <span className="relative flex h-1.5 w-1.5">
              <Circle className="absolute h-1.5 w-1.5 fill-brand-500 text-brand-500" />
            </span>
            Signed in · {user?.position ?? 'Staff'}
          </span>
        </div>

        <form onSubmit={handleSearch} className="ml-auto flex min-w-0 flex-1 justify-end lg:max-w-sm">
          <label htmlFor="staff-search" className="sr-only">
            Search orders
          </label>
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body-faint" />
            <input
              id="staff-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order # or customer…"
              className="w-full rounded-full border border-rule bg-card py-2 pr-4 pl-9 text-sm text-body transition-colors placeholder:text-body-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex flex-none items-center gap-1 sm:gap-2">
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((open) => !open)}
              aria-label={`Notifications${notifications.length ? ` (${notifications.length} new)` : ''}`}
              aria-expanded={notifOpen}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
            >
              <Bell className="h-[1.15rem] w-[1.15rem]" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-rule bg-card shadow-2xl shadow-brand-900/10">
                <div className="border-b border-rule px-4 py-3">
                  <p className="font-display text-sm font-semibold text-body">Notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-body-faint">Nothing new right now.</p>
                ) : (
                  <ul className="max-h-80 divide-y divide-rule overflow-y-auto">
                    {notifications.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.to}
                          onClick={() => setNotifOpen(false)}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-canvas-2"
                        >
                          <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${item.tone}`}>
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-body">{item.title}</span>
                            <span className="truncate text-xs text-body-faint">{item.description}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-canvas-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                {initial}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-body-faint sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-rule bg-card p-1.5 shadow-2xl shadow-brand-900/10">
                <div className="border-b border-rule px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-body">{user?.fullName}</p>
                  <p className="truncate text-xs text-body-faint">{user?.email}</p>
                </div>
                <Link
                  to={profileRoute}
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <UserRound className="h-4 w-4" /> My profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
