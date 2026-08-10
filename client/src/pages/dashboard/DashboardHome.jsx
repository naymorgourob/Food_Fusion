import {
  ClipboardList,
  Wallet,
  CalendarCheck,
  Users,
  TrendingUp,
  UtensilsCrossed,
  Boxes,
  Settings,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActionButton } from '@/components/dashboard/QuickActionButton'
import { ActivityList } from '@/components/dashboard/ActivityList'
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder'

// Static placeholder data — the brief for this part is explicit: no
// database connection yet. Every module built from Part 9 onward replaces
// exactly one of these arrays with a real API call; the layout doesn't change.
const STATS = [
  { icon: ClipboardList, title: 'Total Orders', value: '128', description: '+8 since yesterday' },
  { icon: Wallet, title: "Today's Sales", value: '$1,245', description: '32 orders today' },
  { icon: CalendarCheck, title: 'Reservations', value: '14', description: '5 upcoming today' },
  { icon: Users, title: 'Customers', value: '312', description: '+6 new this week' },
  { icon: TrendingUp, title: 'Revenue', value: '$18,420', description: 'This month' },
]

const QUICK_ACTIONS = [
  { icon: UtensilsCrossed, label: 'Add Menu Item', to: '/dashboard/menu' },
  { icon: ClipboardList, label: 'View Orders', to: '/dashboard/orders' },
  { icon: CalendarCheck, label: 'Reservations', to: '/dashboard/reservations' },
  { icon: Boxes, label: 'Inventory', to: '/dashboard/inventory' },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
]

const RECENT_ORDERS = [
  { primary: 'Order #1042', secondary: 'Table 4 · Dine-in', status: 'Completed', meta: '5 min ago' },
  { primary: 'Order #1041', secondary: 'Takeaway', status: 'Pending', meta: '12 min ago' },
  { primary: 'Order #1040', secondary: 'Table 2 · Dine-in', status: 'Completed', meta: '28 min ago' },
]

const RECENT_USERS = [
  { primary: 'Priya Nair', secondary: 'New customer', status: 'Active', meta: '1 hr ago' },
  { primary: 'James Carter', secondary: 'New customer', status: 'Active', meta: '3 hrs ago' },
  { primary: 'Aisha Khan', secondary: 'New customer', status: 'Active', meta: 'Yesterday' },
]

const RECENT_RESERVATIONS = [
  { primary: 'Table 6 · 4 guests', secondary: 'Maria Lopez', status: 'Confirmed', meta: 'Today, 7:30 PM' },
  { primary: 'Table 3 · 2 guests', secondary: 'David Kim', status: 'Pending', meta: 'Today, 8:00 PM' },
  { primary: 'Table 8 · 6 guests', secondary: 'Sara Ahmed', status: 'Confirmed', meta: 'Tomorrow, 1:00 PM' },
]

export default function DashboardHome() {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="stats-heading" className="flex flex-col gap-4">
        <h2 id="stats-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-actions-heading" className="flex flex-col gap-4">
        <h2 id="quick-actions-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton key={action.label} {...action} />
          ))}
        </div>
      </section>

      <section aria-labelledby="charts-heading" className="flex flex-col gap-4">
        <h2 id="charts-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Analytics
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartPlaceholder title="Sales Chart" />
          <ChartPlaceholder title="Revenue Chart" />
          <ChartPlaceholder title="Orders Overview" />
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="flex flex-col gap-4">
        <h2 id="activity-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ActivityList title="Recent Orders" items={RECENT_ORDERS} />
          <ActivityList title="Recent Users" items={RECENT_USERS} />
          <ActivityList title="Recent Reservations" items={RECENT_RESERVATIONS} />
        </div>
      </section>
    </div>
  )
}
