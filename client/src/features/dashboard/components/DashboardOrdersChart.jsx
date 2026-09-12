import { Link } from 'react-router-dom'
import { ClipboardList, Utensils, ShoppingBag, Truck, ChevronRight } from 'lucide-react'
import { BarChart } from '@/features/reports/components/BarChart'
import { money } from '@/utils/format'

function formatShortDate(label, granularity) {
  if (!label) return ''
  if (granularity === 'day') {
    return new Date(`${label}T00:00:00Z`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }
  const [year, month] = label.split('-')
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleDateString(undefined, {
    month: 'short',
    timeZone: 'UTC',
  })
}

export function DashboardOrdersChart({ ordersSummary, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        <div className="skeleton h-56 w-full rounded-xl" />
      </div>
    )
  }

  const series = ordersSummary?.series ?? []
  const chartData = series.map((bucket) => ({
    label: bucket.label,
    shortLabel: formatShortDate(bucket.label, ordersSummary?.granularity),
    value: bucket.orderCount,
  }))

  const totalOrders = ordersSummary?.totalOrders ?? 0
  const avgValue = ordersSummary?.averageOrderValue ?? 0
  const dineInCount = ordersSummary?.byOrderType?.DINE_IN ?? 0
  const takeawayCount = ordersSummary?.byOrderType?.TAKEAWAY ?? 0
  const deliveryCount = ordersSummary?.byOrderType?.DELIVERY ?? 0

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-rule/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Order Volume & Dining Types
            </h3>
            <span className="text-xs text-body-faint">
              Historical ordering volume and fulfillment mix
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
        >
          View All Orders <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Fulfillment Mix Badges */}
      <div className="my-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rule bg-canvas/60 p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-body-faint">Fulfillment:</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-rule bg-card px-2 py-0.5 font-semibold text-body">
            <Utensils className="h-3 w-3 text-brand-500" />
            Dine-In: {dineInCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-rule bg-card px-2 py-0.5 font-semibold text-body">
            <ShoppingBag className="h-3 w-3 text-amber-500" />
            Takeaway: {takeawayCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-rule bg-card px-2 py-0.5 font-semibold text-body">
            <Truck className="h-3 w-3 text-emerald-500" />
            Delivery: {deliveryCount}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-body-muted">
          <span>Total: <strong className="text-body font-bold">{totalOrders} orders</strong></span>
          <span>Avg: <strong className="text-body font-bold">{money(avgValue)}</strong></span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="pt-2">
        <BarChart
          data={chartData}
          formatValue={(val) => `${val} orders`}
          color="#0284c7" // sky-600
          emptyMessage="No order records found for this period."
        />
      </div>
    </div>
  )
}

