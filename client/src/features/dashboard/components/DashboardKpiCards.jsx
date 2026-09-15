import { motion } from 'framer-motion'
import {
  Wallet,
  Flame,
  ClipboardList,
  CalendarCheck,
  Users,
  TrendingUp,
} from 'lucide-react'
import { money } from '@/utils/format'

export function DashboardKpiCards({
  stats,
  todaySales = 0,
  todayOrdersCount = 0,
  upcomingReservationsCount = 0,
  totalGuestsCount = 0,
  pendingOrdersCount = 0,
  prepOrdersCount = 0,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-9 w-9 rounded-xl" />
            </div>
            <div className="skeleton h-7 w-28 rounded-lg" />
            <div className="skeleton h-3 w-36 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Gross Revenue',
      value: money(stats?.totalRevenue ?? 0),
      subtitle: `${money(todaySales)} today`,
      badge: 'Paid Invoices',
      icon: Wallet,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
    },
    {
      title: 'Active Orders',
      value: `${stats?.activeOrdersCount ?? 0} active`,
      subtitle: `${pendingOrdersCount} pending · ${prepOrdersCount} in kitchen`,
      badge: 'Floor Queue',
      icon: Flame,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
    },
    {
      title: 'Total Orders',
      value: String(stats?.totalOrders ?? 0),
      subtitle: `${todayOrdersCount} placed today`,
      badge: 'All-Time Volume',
      icon: ClipboardList,
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/40',
    },
    {
      title: 'Reservations',
      value: String(stats?.totalReservations ?? 0),
      subtitle: `${upcomingReservationsCount} upcoming · ${totalGuestsCount} covers`,
      badge: 'Bookings',
      icon: CalendarCheck,
      iconBg: 'bg-gold-500/10 text-gold-600 border-gold-500/20 dark:bg-gold-500/20 dark:text-gold-400 dark:border-gold-500/30',
      badgeBg: 'bg-gold-500/10 text-gold-700 border-gold-500/30 dark:bg-gold-500/20 dark:text-gold-300',
    },
    {
      title: 'Guest Network',
      value: `${stats?.totalCustomers ?? 0} diners`,
      subtitle: `${stats?.totalStaff ?? 0} staff on roster`,
      badge: 'Registered',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/40',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className={`group flex min-h-36 flex-col justify-between rounded-2xl border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md lg:col-span-1 ${
              idx === 0
                ? 'border-brand-200 bg-brand-50/40 dark:border-brand-900/60 dark:bg-brand-950/20 lg:col-span-2'
                : 'border-rule hover:border-brand-300'
            }`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-body-faint">
                {card.title}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.iconBg} transition-transform group-hover:scale-105`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>

            {/* Main Value */}
            <div className="my-2.5 flex flex-col gap-0.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-body">
                {card.value}
              </span>
              <span className="text-xs text-body-muted">{card.subtitle}</span>
            </div>

            {/* Bottom Badge */}
            <div className="pt-2 border-t border-rule/50">
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${card.badgeBg}`}
              >
                {card.badge}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

