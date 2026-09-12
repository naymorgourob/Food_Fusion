import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ShoppingBag, ChevronDown, UserRound, Receipt, LogOut } from 'lucide-react'
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
 * Sticky glass bar. `notifications` and `cartCount` are passed in rather
 * than fetched here: the dashboard already loads orders/reservations, so
 * deriving them there avoids a second set of requests for data the page
 * has in hand.
 */
export function CustomerTopBar({ onOpenMobileSidebar, notifications = [], cartCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(profileRef, () => setProfileOpen(false))

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? '?'

  function handleSearch(event) {
    event.preventDefault()
    // Search hands off to the ordering flow, which is where the menu
    // actually lives — no separate search index to maintain.
    navigate(`${ROUTES.ORDERS}/new${query ? `?q=${encodeURIComponent(query)}` : ''}`)
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
            {greetingFor()}, {firstName} 👋
          </span>
          <span className="truncate text-xs text-body-faint">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>

        <form onSubmit={handleSearch} className="ml-auto flex min-w-0 flex-1 justify-end lg:max-w-sm">
          <label htmlFor="customer-search" className="sr-only">
            Search the menu
          </label>
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body-faint" />
            <input
              id="customer-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes…"
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
                  <p className="px-4 py-6 text-center text-sm text-body-faint">You&apos;re all caught up.</p>
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

          <Link
            to={`${ROUTES.ORDERS}/new`}
            aria-label={`Your order${cartCount ? ` (${cartCount} active)` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[0.6rem] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

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
                  to={ROUTES.PROFILE}
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <UserRound className="h-4 w-4" /> My profile
                </Link>
                <Link
                  to={ROUTES.BILLS}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <Receipt className="h-4 w-4" /> Payment history
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
