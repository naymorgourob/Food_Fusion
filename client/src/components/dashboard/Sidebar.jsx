import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  LayoutGrid,
  ClipboardList,
  CalendarCheck,
  Receipt,
  Boxes,
  Users,
  ChefHat,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, USER_ROLES } from '@/constants'

// Single source of truth for the sidebar's nav list — every future module
// (Part 9+) plugs in here and in App.jsx's route config, nowhere else.
// `roles` defaults to Admin-only; Orders (Part 12) and Billing (Part 13)
// are the modules Staff can reach too, so they list both explicitly.
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true, roles: [USER_ROLES.ADMIN] },
  { label: 'Menu Management', path: '/dashboard/menu', icon: UtensilsCrossed, roles: [USER_ROLES.ADMIN] },
  { label: 'Categories', path: '/dashboard/categories', icon: Tag, roles: [USER_ROLES.ADMIN] },
  { label: 'Tables', path: '/dashboard/tables', icon: LayoutGrid, roles: [USER_ROLES.ADMIN] },
  {
    label: 'Orders',
    path: '/dashboard/orders',
    icon: ClipboardList,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
  },
  {
    label: 'Billing',
    path: '/dashboard/billing',
    icon: Receipt,
    roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
  },
  { label: 'Reservations', path: '/dashboard/reservations', icon: CalendarCheck, roles: [USER_ROLES.ADMIN] },
  { label: 'Inventory', path: '/dashboard/inventory', icon: Boxes, roles: [USER_ROLES.ADMIN] },
  { label: 'Customers', path: '/dashboard/customers', icon: Users, roles: [USER_ROLES.ADMIN] },
  { label: 'Staff', path: '/dashboard/staff', icon: ChefHat, roles: [USER_ROLES.ADMIN] },
  { label: 'Reports', path: '/dashboard/reports', icon: BarChart3, roles: [USER_ROLES.ADMIN] },
  { label: 'Settings', path: '/dashboard/settings', icon: SettingsIcon, roles: [USER_ROLES.ADMIN] },
]

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-all duration-200
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-border px-4">
          {/* `collapsed` is a desktop-only preference — the mobile drawer is
              always full-width, so its labels/brand must stay visible
              regardless of the desktop rail's collapsed state. Hence
              `lg:hidden` (a responsive class) instead of not rendering at
              all, which would hide it on mobile too. */}
          <div className={collapsed ? 'lg:hidden' : ''}>
            <BrandMark size="sm" />
          </div>
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink lg:block"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {visibleNavItems.map(({ label, path, icon: Icon, end }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-ember-50 text-ember-600'
                        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 flex-none" strokeWidth={1.75} />
                  <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-none border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-5 w-5 flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
