import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Radar,
  CalendarCheck,
  Heart,
  Sparkles,
  Receipt,
  UserRound,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

// Every destination already exists as a customer route — this sidebar
// surfaces them, it doesn't add new pages. "Track Order" points at the
// orders list because tracking is per-order (/orders/:id); the list is
// where a customer picks which one to track.
const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.ACCOUNT, icon: LayoutDashboard, end: true },
  { label: 'Order Food', to: `${ROUTES.ORDERS}/new`, icon: UtensilsCrossed },
  { label: 'My Orders', to: ROUTES.ORDERS, icon: ClipboardList, end: true },
  { label: 'Track Order', to: ROUTES.ORDERS, icon: Radar, matchTracking: true },
  { label: 'Reservations', to: ROUTES.RESERVATIONS, icon: CalendarCheck },
  { label: 'Favorites', to: ROUTES.FAVORITES, icon: Heart },
  { label: 'Loyalty Rewards', to: ROUTES.LOYALTY, icon: Sparkles },
  { label: 'Payment History', to: ROUTES.BILLS, icon: Receipt },
  { label: 'Profile', to: ROUTES.PROFILE, icon: UserRound },
]

/**
 * "My Orders" and "Track Order" share the /orders path, so NavLink alone
 * can't tell them apart: an un-`end`ed link to /orders matches /orders/new
 * too, which lit up "Track Order" while the customer was ordering food.
 *
 * Tracking is therefore active only on a specific order's page —
 * /orders/<id> — and never on /orders or /orders/new.
 */
function resolveActive(routerActive, matchTracking, pathname) {
  if (!matchTracking) return routerActive
  return /^\/orders\/(?!new$)[^/]+$/.test(pathname)
}

/**
 * Deep-emerald rail. It stays emerald in both light and dark mode on
 * purpose: the brand colour anchors the app the same way it anchors the
 * public site, and a sidebar that inverts with the theme makes the two
 * modes feel like different products.
 */
export function CustomerSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Customer"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-900 transition-all duration-300 ${
          collapsed ? 'lg:w-[5.25rem]' : 'lg:w-64'
        } ${mobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 flex-none items-center justify-between px-4">
          {/* `collapsed` is a desktop-only preference — the mobile drawer is
              always full width, so the wordmark hides at lg only. */}
          <NavLink to={ROUTES.ACCOUNT} className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 font-display text-sm font-semibold text-gold-300 ring-1 ring-gold-500/40">
              F
            </span>
            <span className={`flex flex-col leading-none ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="font-display text-base font-semibold whitespace-nowrap text-white">
                FoodFusion
              </span>
              <span className="text-[0.6rem] tracking-[0.18em] whitespace-nowrap text-gold-300 uppercase">
                Fine Dining
              </span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white lg:block"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, to, icon: Icon, end, matchTracking }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      resolveActive(isActive, matchTracking, pathname)
                        ? 'bg-white/12 text-white'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  {({ isActive: routerActive }) => {
                    const isActive = resolveActive(routerActive, matchTracking, pathname)
                    return (
                    <>
                      {/* Gold bar marks the current page — a second, non-colour
                          cue alongside the lighter background. */}
                      <span
                        aria-hidden
                        className={`absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-400 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <Icon className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
                      <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
                    </>
                    )
                  }}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-none border-t border-white/10 p-3">
          <div className={`mb-2 flex items-center gap-3 px-2 py-1.5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold-500 font-display text-sm font-semibold text-charcoal">
              {initial}
            </span>
            <span className={`flex min-w-0 flex-col leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="truncate text-sm font-medium text-white">{user?.fullName}</span>
              <span className="truncate text-xs text-white/50">{user?.email}</span>
            </span>
          </div>

          <NavLink
            to={ROUTES.SETTINGS}
            onClick={onCloseMobile}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Settings className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
