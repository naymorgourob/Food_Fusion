import {
  Wallet,
  ShoppingBag,
  CalendarCheck,
  TrendingUp,
  Users,
  ChefHat,
  UtensilsCrossed,
  Boxes,
} from 'lucide-react'
import { money } from '@/utils/format'

export function OverviewKpiGrid({
  stats,
  ordersSummary,
  revenueSummary,
  reservationsSummary,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-7 rounded-xl" />
            </div>
            <div className="skeleton h-7 w-28 rounded-lg" />
            <div className="skeleton h-3 w-36 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const periodRevenue = revenueSummary?.totalRevenue ?? stats?.totalRevenue ?? 0
  const periodOrders = ordersSummary?.totalOrders ?? stats?.totalOrders ?? 0
  const periodReservations = reservationsSummary?.total ?? stats?.totalReservations ?? 0
  const avgOrderValue =
    ordersSummary?.averageOrderValue ??
    (periodOrders > 0 ? (ordersSummary?.totalOrderValue ?? 0) / periodOrders : 0)

  const primaryCards = [
    {
      title: 'Gross Revenue',
      value: money(periodRevenue),
      subtext: `${revenueSummary?.totalBills ?? 0} paid transactions`,
      icon: Wallet,
      tone: 'emerald',
    },
    {
      title: 'Total Orders',
      value: periodOrders,
      subtext: `${stats?.completedOrdersCount ?? 0} completed · ${stats?.activeOrdersCount ?? 0} active`,
      icon: ShoppingBag,
      tone: 'gold',
    },
    {
      title: 'Table Bookings',
      value: periodReservations,
      subtext: `${reservationsSummary?.totalGuests ?? 0} guests reserved`,
      icon: CalendarCheck,
      tone: 'brand',
    },
    {
      title: 'Average Ticket',
      value: money(avgOrderValue),
      subtext: 'Average spend per order',
      icon: TrendingUp,
      tone: 'blue',
    },
  ]

  const toneStyles = {
    emerald:
      'border-emerald-200/60 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
    gold:
      'border-gold-200/60 bg-gold-50/50 text-gold-800 dark:border-gold-900/40 dark:bg-gold-950/20 dark:text-gold-300',
    brand:
      'border-brand-200/60 bg-brand-50/50 text-brand-800 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300',
    blue:
      'border-blue-200/60 bg-blue-50/50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300',
  }

  const secondaryPills = [
    { label: 'Customers', value: stats?.totalCustomers ?? '—', icon: Users },
    { label: 'Staff On Duty', value: stats?.totalStaff ?? '—', icon: ChefHat },
    { label: 'Menu Dishes', value: stats?.totalMenuItems ?? '—', icon: UtensilsCrossed },
    { label: 'Inventory Items', value: stats?.totalInventoryItems ?? '—', icon: Boxes },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-4 transition-all hover:border-brand-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-body-muted">{card.title}</span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl border ${toneStyles[card.tone]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-body tracking-tight">
                  {card.value}
                </span>
                <span className="mt-1 text-[11px] font-medium text-body-faint">
                  {card.subtext}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Secondary Resource Metrics Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {secondaryPills.map((pill) => {
          const Icon = pill.icon
          return (
            <div
              key={pill.label}
              className="flex items-center gap-2.5 rounded-xl border border-rule bg-card/60 px-3 py-2 text-xs"
            >
              <Icon className="h-3.5 w-3.5 text-body-faint flex-none" />
              <span className="truncate text-body-muted">{pill.label}:</span>
              <strong className="ml-auto font-bold text-body">{pill.value}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

