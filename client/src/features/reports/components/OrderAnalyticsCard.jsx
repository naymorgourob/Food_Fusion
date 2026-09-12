import { ShoppingBag, Utensils, Truck, Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { BarChart } from '@/features/reports/components/BarChart'
import { money } from '@/utils/format'

function formatShortDate(label, granularity) {
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

export function OrderAnalyticsCard({ ordersSummary, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5">
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
  const byType = ordersSummary?.byOrderType ?? { DINE_IN: 0, DELIVERY: 0, TAKEAWAY: 0 }
  const byStatus = ordersSummary?.byStatus ?? {}

  const completedCount = byStatus.COMPLETED ?? 0
  const activeCount =
    (byStatus.PENDING ?? 0) +
    (byStatus.ACCEPTED ?? 0) +
    (byStatus.PREPARING ?? 0) +
    (byStatus.READY ?? 0) +
    (byStatus.ON_THE_WAY ?? 0) +
    (byStatus.SERVED ?? 0)
  const cancelledCount = byStatus.CANCELLED ?? 0

  const dineInPct = totalOrders > 0 ? Math.round((byType.DINE_IN / totalOrders) * 100) : 0
  const deliveryPct = totalOrders > 0 ? Math.round((byType.DELIVERY / totalOrders) * 100) : 0
  const takeawayPct = totalOrders > 0 ? Math.round((byType.TAKEAWAY / totalOrders) * 100) : 0

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-50 text-gold-700 dark:bg-gold-950/30 dark:text-gold-400">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Order Volume & Trends
            </h3>
            <span className="text-xs text-body-faint">
              {ordersSummary?.granularity === 'day' ? 'Daily placed orders' : 'Monthly placed orders'}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-body-muted">Placed:</span>
          <span className="font-display text-xl font-bold text-body">
            {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="pt-2">
        <BarChart
          data={chartData}
          formatValue={(val) => `${val} orders`}
          color="#d97706" // amber-600
          emptyMessage="No orders recorded for this time frame"
        />
      </div>

      {/* Breakdowns Footer (Order Types & Status) */}
      <div className="grid grid-cols-1 gap-3 border-t border-rule pt-4 sm:grid-cols-2">
        {/* Order Types */}
        <div className="flex flex-col gap-2 rounded-xl bg-canvas p-3">
          <span className="text-xs font-semibold text-body-muted">Order Types</span>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <Utensils className="h-3.5 w-3.5 text-gold-600" /> Dine-In
              </span>
              <span className="font-semibold text-body">
                {byType.DINE_IN} <span className="text-body-faint font-normal">({dineInPct}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <Truck className="h-3.5 w-3.5 text-brand-600" /> Delivery
              </span>
              <span className="font-semibold text-body">
                {byType.DELIVERY} <span className="text-body-faint font-normal">({deliveryPct}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <Package className="h-3.5 w-3.5 text-blue-600" /> Takeaway
              </span>
              <span className="font-semibold text-body">
                {byType.TAKEAWAY} <span className="text-body-faint font-normal">({takeawayPct}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="flex flex-col gap-2 rounded-xl bg-canvas p-3">
          <span className="text-xs font-semibold text-body-muted">Fulfillment Status</span>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {completedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Active / In-Kitchen
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {activeCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-body">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> Cancelled
              </span>
              <span className="font-semibold text-body-muted">
                {cancelledCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

