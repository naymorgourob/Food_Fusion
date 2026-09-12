import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  CalendarCheck,
  UserRound,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

// Waiter dining-floor workspace navigation
const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.WAITER_HOME, icon: LayoutDashboard, end: true },
  { label: 'Orders', to: ROUTES.WAITER_ORDERS, icon: UtensilsCrossed },
  { label: 'Tables', to: ROUTES.WAITER_TABLES, icon: LayoutGrid },
  { label: 'Reservations', to: ROUTES.WAITER_RESERVATIONS, icon: CalendarCheck },
]

export function WaiterSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(ROUTES.HOME, { replace: true })
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
        aria-label="Waiter Workspace Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-900 transition-all duration-300 ${
          collapsed ? 'lg:w-[5.25rem]' : 'lg:w-64'
        } ${mobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 flex-none items-center justify-between px-4">
          <NavLink to={ROUTES.WAITER_HOME} className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 font-display text-sm font-semibold text-gold-300 ring-1 ring-gold-500/40">
              F
            </span>
            <span className={`flex flex-col leading-none ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="font-display text-base font-semibold whitespace-nowrap text-white">
                FoodFusion
              </span>
              <span className="text-[0.6rem] tracking-[0.18em] whitespace-nowrap text-gold-300 uppercase">
                Waiter Workspace
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
            {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/12 text-white'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden
                        className={`absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-400 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <Icon className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
                      <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
                    </>
                  )}
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
              <span className="truncate text-xs text-white/50">{user?.position ?? 'Waiter'}</span>
            </span>
          </div>

          <NavLink
            to={ROUTES.WAITER_PROFILE}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/12 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <UserRound className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Profile</span>
          </NavLink>

          <NavLink
            to={ROUTES.WAITER_SETTINGS}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/12 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Settings className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

