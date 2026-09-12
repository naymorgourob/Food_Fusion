import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed,
  ClipboardList,
  LayoutGrid,
  CalendarCheck,
  Boxes,
  Receipt,
  UserCheck,
  TrendingUp,
  Sparkles,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-body-faint">
            Operations Launchpad
          </span>
        </div>
        <span className="text-[11px] text-body-muted hidden sm:inline">
          Direct access to core restaurant modules
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-rule bg-card p-3.5 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:scale-95"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-rule/50 ${action.color} transition-transform group-hover:scale-110`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-body group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {action.label}
                </span>
                <span className="text-[10px] text-body-faint leading-tight hidden sm:block truncate max-w-[100px]">
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

