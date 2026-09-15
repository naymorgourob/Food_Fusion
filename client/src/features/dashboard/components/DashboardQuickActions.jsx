import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  ClipboardList,
  LayoutGrid,
  CalendarCheck,
  Boxes,
  Receipt,
  UserCheck,
  TrendingUp,
} from 'lucide-react'

const ACTIONS = [
  {
    icon: UtensilsCrossed,
    label: 'Menu Catalog',
    description: 'Add or edit dishes',
    to: '/dashboard/menu',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
  },
  {
    icon: ClipboardList,
    label: 'Live Orders',
    description: 'Active kitchen queue',
    to: '/dashboard/orders',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400',
  },
  {
    icon: LayoutGrid,
    label: 'Floor Plan',
    description: 'Manage tables & seats',
    to: '/dashboard/tables',
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400',
  },
  {
    icon: CalendarCheck,
    label: 'Reservations',
    description: 'Guest bookings schedule',
    to: '/dashboard/reservations',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  {
    icon: Boxes,
    label: 'Inventory',
    description: 'Ingredient restock levels',
    to: '/dashboard/inventory',
    color: 'text-gold-600 bg-gold-500/10 dark:bg-gold-500/20 dark:text-gold-400',
  },
  {
    icon: Receipt,
    label: 'Guest Billing',
    description: 'Invoices & receivables',
    to: '/dashboard/billing',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400',
  },
  {
    icon: UserCheck,
    label: 'Staff Team',
    description: 'Staff roles & accounts',
    to: '/dashboard/staff',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
  },
  {
    icon: TrendingUp,
    label: 'Analytics',
    description: 'Sales & volume reports',
    to: '/dashboard/reports',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400',
  },
]

export function DashboardQuickActions() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1 border-l-2 border-brand-600 pl-3 dark:border-brand-400 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="font-display text-sm font-bold tracking-wide text-body">
          Operations launchpad
        </h2>
        <p className="text-xs text-body-muted">Jump straight into a restaurant workspace</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group flex items-center gap-3 rounded-2xl border border-rule bg-card p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:scale-[0.99]"
            >
              <span
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-rule/50 ${action.color} transition-transform group-hover:scale-110`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs font-bold text-body group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {action.label}
                </span>
                <span className="truncate text-[11px] leading-tight text-body-faint">
                  {action.description}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

