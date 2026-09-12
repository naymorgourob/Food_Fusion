import { NavLink, useNavigate, Link } from 'react-router-dom'
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
  X,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, USER_ROLES } from '@/constants'

/**
 * Single source of truth for Admin & Staff dashboard navigation.
 * Structured into clear restaurant management domains:
 * - Overview
 * - Operations
 * - Menu & Inventory
 * - Management
 */
const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        end: true,
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Orders',
        path: '/dashboard/orders',
        icon: ClipboardList,
        roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
      },
      {
        label: 'Tables',
        path: '/dashboard/tables',
        icon: LayoutGrid,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Reservations',
        path: '/dashboard/reservations',
        icon: CalendarCheck,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Billing',
        path: '/dashboard/billing',
        icon: Receipt,
        roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
      },
    ],
  },
  {
    title: 'Menu & Pantry',
    items: [
      {
        label: 'Menu Management',
        path: '/dashboard/menu',
        icon: UtensilsCrossed,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Categories',
        path: '/dashboard/categories',
        icon: Tag,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Inventory',
        path: '/dashboard/inventory',
        icon: Boxes,
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Customers',
        path: '/dashboard/customers',
        icon: Users,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Staff',
        path: '/dashboard/staff',
        icon: ChefHat,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Reports',
        path: '/dashboard/reports',
        icon: BarChart3,
        roles: [USER_ROLES.ADMIN],
      },
      {
        label: 'Settings',
        path: '/dashboard/settings',
        icon: SettingsIcon,
        roles: [USER_ROLES.ADMIN],
      },
    ],
  },
]

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(ROUTES.HOME, { replace: true })
  }

  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'
  const isAdmin = user?.role === USER_ROLES.ADMIN

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-xs lg:hidden cursor-default"
        />
      )}

      {/* Main Sidebar Rail */}
      <aside
        aria-label="Admin Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 shadow-xs
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'w-64 translate-x-0 shadow-2xl' : 'w-64 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Header: Branding & Toggle ─────────────────────────────── */}
        <div
          className={`flex h-16 flex-none items-center border-b border-border px-3.5 transition-all ${
            collapsed ? 'lg:justify-center' : 'justify-between'
          }`}
        >
          {/* Brand Identity */}
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 overflow-hidden transition-transform active:scale-95 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 font-display text-sm font-bold text-white shadow-xs">
              F
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight text-ink">
                FoodFusion
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-ink-faint uppercase mt-0.5">
                {isAdmin ? 'Admin Console' : 'Staff Portal'}
              </span>
            </div>
          </Link>

          {/* Desktop Collapsed Brand Emblem & Expand Button */}
          {collapsed && (
            <div className="hidden lg:flex flex-col items-center gap-1.5 py-1">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar (⌘B)"
                className="group flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-xs hover:ring-2 hover:ring-brand-500/30 transition-all"
              >
                <span className="font-display text-sm font-bold group-hover:hidden">F</span>
                <ChevronsRight className="h-4 w-4 hidden group-hover:block transition-transform" />
              </button>
            </div>
          )}

          {/* Desktop Collapse Toggle (When expanded) */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar (⌘B)"
              className="hidden rounded-xl p-2 text-ink-muted hover:bg-surface-2 hover:text-ink lg:block transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-xl p-2 text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Navigation Items & Sections ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
          {NAV_SECTIONS.map((section, sectionIdx) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(user?.role)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title} className="flex flex-col gap-1">
                {/* Section Header */}
                <div
                  className={`px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint ${
                    collapsed ? 'lg:hidden' : ''
                  }`}
                >
                  {section.title}
                </div>

                {/* Collapsed Rail Divider */}
                {collapsed && sectionIdx > 0 && (
                  <div className="hidden lg:block my-1 mx-auto w-6 border-t border-border/70" />
                )}

                {/* Item List */}
                <ul className="flex flex-col gap-1">
                  {visibleItems.map(({ label, path, icon: Icon, end }) => (
                    <li key={path}>
                      <NavLink
                        to={path}
                        end={end}
                        onClick={onCloseMobile}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all ${
                            collapsed ? 'lg:justify-center lg:px-0' : 'px-3'
                          } ${
                            isActive
                              ? 'bg-brand-500/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 font-semibold border border-brand-500/20 shadow-xs'
                              : 'text-ink-muted hover:bg-surface-2 hover:text-ink border border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active Indicator Bar */}
                            <span
                              aria-hidden
                              className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-500 dark:bg-brand-400 transition-all duration-200 ${
                                isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                              }`}
                            />

                            {/* Icon */}
                            <Icon
                              className={`h-5 w-5 flex-none transition-transform duration-150 group-hover:scale-105 ${
                                isActive
                                  ? 'text-brand-600 dark:text-brand-400'
                                  : 'text-ink-faint group-hover:text-ink'
                              }`}
                              strokeWidth={isActive ? 2 : 1.75}
                            />

                            {/* Label */}
                            <span
                              className={`truncate font-display text-[13px] tracking-tight ${
                                collapsed ? 'lg:hidden' : ''
                              }`}
                            >
                              {label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* ── Footer: Profile & Logout ──────────────────────────────── */}
        <div className="flex-none border-t border-border p-3 space-y-2">
          {/* User Profile Card */}
          <div
            className={`flex items-center gap-2.5 rounded-xl border border-border/70 bg-canvas/60 p-2 ${
              collapsed ? 'lg:justify-center lg:p-1.5' : ''
            }`}
          >
            <span
              title={user?.fullName || 'User Profile'}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-500/10 font-display text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
            >
              {initial}
            </span>
            <div
              className={`flex min-w-0 flex-col leading-tight ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              <span className="truncate text-xs font-bold text-ink">
                {user?.fullName || 'Administrator'}
              </span>
              <span className="truncate text-[10px] font-semibold text-ink-faint">
                {isAdmin ? 'Executive Admin' : 'Staff Member'}
              </span>
            </div>
          </div>

          {/* Quick link to public restaurant site */}
          <Link
            to={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'View Public Restaurant' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <ExternalLink className="h-4 w-4 flex-none text-ink-faint" />
            <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>
              View Restaurant
            </span>
          </Link>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-danger-soft hover:text-danger transition-colors ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <LogOut className="h-4 w-4 flex-none" strokeWidth={1.75} />
            <span className={collapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
