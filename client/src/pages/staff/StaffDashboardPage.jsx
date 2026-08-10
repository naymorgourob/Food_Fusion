import { useMemo } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, ChefHat, CheckCircle2, CalendarCheck, LayoutGrid, DollarSign, ArrowRight } from 'lucide-react'
import { orderGrandTotal } from '@/features/orders/constants'
import { money } from '@/utils/format'
import { ROUTES } from '@/constants'
import { Card } from '@/components/customer/ui'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function KpiCard({ icon: Icon, label, value, to, tone = 'brand' }) {
  const toneClasses =
    tone === 'gold'
      ? 'bg-gold-100 text-gold-700 dark:bg-gold-100/10 dark:text-gold-300'
      : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'

  const linkProps = to ? { as: Link, to } : {}

  return (
    <Card {...linkProps} interactive={Boolean(to)} className="flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl ${toneClasses}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-2xl font-semibold text-body">{value}</span>
        <span className="truncate text-xs font-medium text-body-faint">{label}</span>
      </div>
      {to && <ArrowRight className="ml-auto h-4 w-4 flex-none text-body-faint" />}
    </Card>
  )
}

/**
 * Staff's dashboard overview (UI-07).
 *
 * Every KPI is computed from data Staff can already fetch — orders,
 * tables, reservations, all via the existing StaffLayout hooks. There is
 * no "Revenue Today" card, and this is deliberate: GET
 * /reports/dashboard-stats and GET /reports/revenue-summary are both
 * authorizeAdmin, and Staff cannot generate or read Bills either
 * (billing.routes.js gates most of it to Admin, and even where Staff can
 * read a bill it's per-order, not a daily total). Rather than call an
 * endpoint that would 403, or invent a number, the card shown instead is
 * "Orders value today" — the sum of today's order totals, which Staff can
 * compute from data already in hand. It is a real number, just not
 * "revenue" in the accounting sense (that requires paid bills, which
 * Staff can't query in aggregate).
 */
export default function StaffDashboardPage() {
  const { orders, reservations, tables } = useOutletContext()

  const stats = useMemo(() => {
    const today = startOfToday()
    const todaysOrders = orders.orders.filter((order) => new Date(order.createdAt) >= today)

    const preparing = orders.orders.filter((order) => order.status === 'PREPARING').length
    const ready = orders.orders.filter((order) => order.status === 'READY').length

    const todaysReservations = reservations.reservations.filter((row) => {
      const date = new Date(row.reservationDate)
      return date >= today && row.status !== 'CANCELLED'
    }).length

    const occupiedTables = tables.tables.filter((table) => table.status === 'OCCUPIED').length

    const orderValueToday = todaysOrders.reduce((sum, order) => sum + orderGrandTotal(order), 0)

    return {
      ordersToday: todaysOrders.length,
      preparing,
      ready,
      reservationsToday: todaysReservations,
      occupiedTables,
      totalTables: tables.tables.length,
      orderValueToday,
    }
  }, [orders.orders, reservations.reservations, tables.tables])

  const isLoading = orders.isLoading || reservations.isLoading || tables.isLoading

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Dashboard</h1>
        <p className="text-sm text-body-muted">Today at a glance.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-24 rounded-2xl" aria-hidden />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <KpiCard icon={ClipboardList} label="Orders today" value={stats.ordersToday} to={ROUTES.STAFF_ORDERS} />
          <KpiCard icon={ChefHat} label="Preparing" value={stats.preparing} to={ROUTES.STAFF_KITCHEN} tone="gold" />
          <KpiCard icon={CheckCircle2} label="Ready" value={stats.ready} to={ROUTES.STAFF_KITCHEN} />
          <KpiCard
            icon={CalendarCheck}
            label="Reservations today"
            value={stats.reservationsToday}
            to={ROUTES.STAFF_RESERVATIONS}
          />
          <KpiCard
            icon={LayoutGrid}
            label="Occupied tables"
            value={`${stats.occupiedTables} / ${stats.totalTables}`}
            to={ROUTES.STAFF_TABLES}
          />
          <KpiCard icon={DollarSign} label="Order value today" value={money(stats.orderValueToday)} tone="gold" />
        </motion.div>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="font-display text-base font-semibold text-body">Where to start</h2>
        <p className="text-sm leading-relaxed text-body-muted">
          The Kitchen Queue holds every order that still needs cooking, sorted by how long it&rsquo;s been
          waiting. That&rsquo;s the fastest place to see what needs attention right now.
        </p>
        <Link
          to={ROUTES.STAFF_KITCHEN}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Open Kitchen Queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}
