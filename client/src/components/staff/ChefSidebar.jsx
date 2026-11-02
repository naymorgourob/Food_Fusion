import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ChefHat,
  Package,
  UserRound,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

// Focused kitchen/chef command workspace navigation
const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.CHEF_HOME, icon: LayoutDashboard, end: true },
  { label: 'Kitchen Orders', to: ROUTES.CHEF_ORDERS, icon: ChefHat },
  { label: 'Kitchen Inventory', to: ROUTES.CHEF_INVENTORY, icon: Package },
  { label: 'My Payslips', to: '/staff/chef/payslips', icon: Wallet },
]

export function ChefSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
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
        aria-label="Chef Workspace Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-900 transition-all duration-300 ${
          collapsed ? 'lg:w-[5.25rem]' : 'lg:w-80'
        } ${mobileOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-24 flex-none items-center justify-between px-4">
          <NavLink to={ROUTES.CHEF_HOME} className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/brand/logo-mark.png"
              alt=""
              aria-hidden
              className={`h-[4.5rem] w-[4.5rem] flex-none rounded-full object-cover shadow-lg ring-2 ring-gold-300/60 transition-all ${collapsed ? 'lg:h-14 lg:w-14' : ''}`}
            />
            <span className={`flex flex-col leading-none ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="font-display text-xl font-semibold whitespace-nowrap text-white">
                FoodFusion
              </span>
              <span className="mt-1 text-[0.75rem] tracking-[0.1em] whitespace-nowrap text-gold-300 uppercase">
                Chef Workspace
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
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
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
                    `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-medium transition-colors ${
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
                      <Icon className="h-[1.35rem] w-[1.35rem] flex-none" strokeWidth={1.75} />
                      <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-none border-t border-white/10 p-3">
          <div
            className={`mb-2 flex items-center gap-3 px-2 py-1.5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold-500 font-display text-base font-semibold text-charcoal">
              {initial}
            </span>
            <span className={`flex min-w-0 flex-col leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="truncate text-base font-medium text-white">{user?.fullName}</span>
              <span className="truncate text-sm text-white/50">{user?.position ?? 'Chef'}</span>
            </span>
          </div>

          <NavLink
            to={ROUTES.CHEF_PROFILE}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-medium transition-colors ${
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <UserRound className="h-[1.35rem] w-[1.35rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Profile</span>
          </NavLink>

          <NavLink
            to={ROUTES.CHEF_SETTINGS}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-medium transition-colors ${
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Settings className="h-[1.35rem] w-[1.35rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-base font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-[1.35rem] w-[1.35rem] flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
