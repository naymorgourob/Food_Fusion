import { useMemo } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChefHat,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Package,
  ArrowRight,
  Flame,
  Utensils,
  ReceiptText,
  CalendarClock,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { Card, SectionTitle, SkeletonCard } from '@/components/customer/ui'
import { priorityFor, minutesWaiting } from '@/features/orders/staffOrderHelpers'
import { getScheduledDineInTimes, isScheduledPrepDue } from '@/features/orders/constants'
import { orderNo } from '@/utils/format'

function KpiCard({ icon: Icon, label, value, to, subtext, tone = 'brand' }) {
  const toneMap = {
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20',
    red: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500/20',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/20',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/20',
  }

  const linkProps = to ? { as: Link, to } : {}

  return (
    <Card
      {...linkProps}
      interactive={Boolean(to)}
      className="flex flex-col justify-between gap-3 p-4 transition-all hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${toneMap[tone] || toneMap.brand}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        {to && <ArrowRight className="h-4 w-4 text-body-faint" />}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-2xl font-bold text-body">{value}</span>
        <span className="truncate text-xs font-semibold text-body-muted">{label}</span>
        {subtext && <span className="truncate text-[0.7rem] text-body-faint">{subtext}</span>}
      </div>
    </Card>
  )
}

export default function ChefDashboardPage() {
  const { orders, inventory } = useOutletContext()

  const allOrders = orders?.orders || []
  const inventoryItems = inventory?.items || []

  const stats = useMemo(() => {
    let pendingCount = 0
    let preparingCount = 0
    let readyCount = 0
    let urgentCount = 0

    for (const order of allOrders) {
      if (order.status === 'PENDING') pendingCount++
      if (['ACCEPTED', 'PREPARING'].includes(order.status)) preparingCount++
      if (order.status === 'READY') readyCount++

      const priority = priorityFor(order)
      if (priority === 'high' && ['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
        urgentCount++
      }
    }

    let lowStockCount = 0
    let outOfStockCount = 0
    for (const item of inventoryItems) {
      if (item.status === 'OUT_OF_STOCK') outOfStockCount++
      else if (item.status === 'LOW_STOCK') lowStockCount++
    }

    return {
      pending: pendingCount,
      preparing: preparingCount,
      ready: readyCount,
      urgent: urgentCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    }
  }, [allOrders, inventoryItems])

  // Top active/urgent orders for quick action
  const urgentOrders = useMemo(() => {
    return allOrders
      .filter((o) => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status))
      .sort((a, b) => minutesWaiting(b) - minutesWaiting(a))
      .slice(0, 4)
  }, [allOrders])

  // Scheduled dine-in orders
  const scheduledOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const times = getScheduledDineInTimes(order)
      return times && !['COMPLETED', 'CANCELLED'].includes(order.status)
    })
  }, [allOrders])

  // Critical stock shortages
  const criticalStock = useMemo(() => {
    return inventoryItems
      .filter((item) => item.status === 'OUT_OF_STOCK' || item.status === 'LOW_STOCK')
      .slice(0, 4)
  }, [inventoryItems])

  const isLoading = orders?.isLoading || inventory?.isLoading

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Kitchen Dashboard</h1>
        <p className="text-sm text-body-muted">
          Live kitchen command center — manage incoming orders, cooking queues, and ingredient stock.
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            icon={ReceiptText}
            label="New Orders"
            value={stats.pending}
            to={`${ROUTES.CHEF_ORDERS}?tab=new`}
            subtext="Awaiting kitchen accept"
            tone={stats.pending > 0 ? 'amber' : 'brand'}
          />
          <KpiCard
            icon={ChefHat}
            label="In Preparation"
            value={stats.preparing}
            to={`${ROUTES.CHEF_ORDERS}?tab=preparing`}
            subtext="Currently being cooked"
            tone="brand"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Ready to Serve"
            value={stats.ready}
            to={`${ROUTES.CHEF_ORDERS}?tab=ready`}
            subtext="Plated & waiting for pass"
            tone={stats.ready > 0 ? 'emerald' : 'brand'}
          />
          <KpiCard
            icon={AlertTriangle}
            label="Urgent / Delayed"
            value={stats.urgent}
            to={`${ROUTES.CHEF_ORDERS}?tab=urgent`}
            subtext="Waiting past threshold"
            tone={stats.urgent > 0 ? 'red' : 'brand'}
          />
          <KpiCard
            icon={Package}
            label="Low Stock Items"
            value={stats.lowStock}
            to={`${ROUTES.CHEF_INVENTORY}?status=LOW_STOCK`}
            subtext="Below min threshold"
            tone={stats.lowStock > 0 ? 'amber' : 'brand'}
          />
          <KpiCard
            icon={AlertOctagon}
            label="Out of Stock"
            value={stats.outOfStock}
            to={`${ROUTES.CHEF_INVENTORY}?status=OUT_OF_STOCK`}
            subtext="Depleted ingredients"
            tone={stats.outOfStock > 0 ? 'red' : 'brand'}
          />
        </motion.div>
      )}

      {/* Quick Kitchen Workspaces Banner */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between gap-4 p-5 bg-gradient-to-br from-brand-900/10 to-transparent border-brand-500/20">
          <div>
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
              <ChefHat className="h-5 w-5" />
              <h2 className="font-display text-base font-semibold text-body">Kitchen Orders Queue</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-body-muted">
              Accept new orders, set kitchen ETAs, track preparation timers, and update order statuses in real time.
            </p>
          </div>
          <Link
            to={ROUTES.CHEF_ORDERS}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
          >
            Open Kitchen Orders
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="flex flex-col justify-between gap-4 p-5 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Package className="h-5 w-5" />
              <h2 className="font-display text-base font-semibold text-body">Kitchen Inventory</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-body-muted">
              Check live ingredient levels, quickly adjust quantities after prep, and request stock refills from management.
            </p>
          </div>
          <Link
            to={ROUTES.CHEF_INVENTORY}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            Check Stock & Inventory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>

      {/* Active Orders Needing Attention */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SectionTitle>Active Kitchen Queue ({urgentOrders.length})</SectionTitle>
          <Link
            to={ROUTES.CHEF_ORDERS}
            className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-400"
          >
            View all orders &rarr;
          </Link>
        </div>

        {urgentOrders.length === 0 ? (
          <Card className="p-6 text-center text-xs text-body-faint">
            No active orders waiting in queue right now. Great job!
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {urgentOrders.map((order) => {
              const waited = minutesWaiting(order)
              const priority = priorityFor(order)
              const isUrgent = priority === 'high'

              return (
                <Card
                  key={order.id}
                  as={Link}
                  to={`${ROUTES.CHEF_ORDERS}?q=${order.orderNumber}`}
                  interactive
                  className={`flex flex-col justify-between gap-3 p-4 border transition-all hover:scale-[1.01] ${
                    isUrgent ? 'border-red-300 dark:border-red-800/60 bg-red-50/20' : 'border-rule'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-display text-sm font-semibold text-body">
                        {orderNo(order.orderNumber)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                          order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-body-muted">{order.customer?.fullName || 'Guest'}</p>

                    <ul className="mt-3 flex flex-col gap-1 border-t border-rule pt-2 text-xs text-body-muted">
                      {order.items.slice(0, 2).map((it) => (
                        <li key={it.id} className="truncate">
                          {it.quantity}× {it.menuItem.name}
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="text-[0.7rem] text-body-faint">+{order.items.length - 2} more items</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between border-t border-rule pt-2 text-[0.7rem] text-body-faint">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Waited {waited}m
                    </span>
                    {isUrgent && (
                      <span className="font-bold text-red-600 dark:text-red-400">Needs action</span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Scheduled Dine-in Alerts if present */}
      {scheduledOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            <SectionTitle>Scheduled Dine-In Today ({scheduledOrders.length})</SectionTitle>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {scheduledOrders.map((order) => {
              const times = getScheduledDineInTimes(order)
              const prepDue = isScheduledPrepDue(order)
              return (
                <Card
                  key={order.id}
                  className={`p-4 flex flex-col gap-2 ${prepDue ? 'border-amber-400 bg-amber-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-body">
                      {orderNo(order.orderNumber)}
                    </span>
                    {prepDue && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[0.65rem] font-bold text-charcoal">
                        Start prep now
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-body-muted">{order.customer?.fullName}</p>
                  <div className="text-xs text-body-faint">
                    Arrival:{' '}
                    <strong className="text-body">
                      {times?.arrival.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </strong>{' '}
                    · {order.guestCount ?? 2} guests
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Critical Stock Shortages Alert */}
      {criticalStock.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <SectionTitle>Stock Shortages Alert ({criticalStock.length})</SectionTitle>
            </div>
            <Link
              to={ROUTES.CHEF_INVENTORY}
              className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
            >
              Update inventory &rarr;
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {criticalStock.map((item) => (
              <Card key={item.id} className="p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-body">{item.itemName}</span>
                  <span className="text-[0.7rem] text-body-faint">
                    Current: <strong className="text-body">{Number(item.quantity)} {item.unit}</strong> (Min: {Number(item.minStockLevel)})
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                    item.status === 'OUT_OF_STOCK'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {item.status === 'OUT_OF_STOCK' ? 'Out of stock' : 'Low stock'}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
