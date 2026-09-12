import { Wallet, TrendingUp, Receipt, Percent } from 'lucide-react'
import { LineChart } from '@/features/reports/components/LineChart'
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

export function RevenueAnalyticsCard({ revenueSummary, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        <div className="skeleton h-56 w-full rounded-xl" />
      </div>
    )
  }

  const series = revenueSummary?.series ?? []
  const chartData = series.map((bucket) => ({
    label: bucket.label,
    shortLabel: formatShortDate(bucket.label, revenueSummary?.granularity),
    value: bucket.revenue,
  }))

  const totalRevenue = revenueSummary?.totalRevenue ?? 0
  const avgBill = revenueSummary?.averageBillValue ?? 0
  const totalVat = revenueSummary?.totalVat ?? 0
  const totalDiscount = revenueSummary?.totalDiscount ?? 0

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Card Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Revenue Performance
            </h3>
            <span className="text-xs text-body-faint">
              {revenueSummary?.granularity === 'day' ? 'Daily billed collection' : 'Monthly billed collection'}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-body-muted">Gross:</span>
          <span className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {money(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex flex-col rounded-xl bg-canvas p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-body-muted">
            <TrendingUp className="h-3 w-3 text-body-faint" />
            Avg. Ticket
          </span>
          <span className="font-display text-sm font-bold text-body">
            {money(avgBill)}
          </span>
        </div>

        <div className="flex flex-col rounded-xl bg-canvas p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-body-muted">
            <Receipt className="h-3 w-3 text-body-faint" />
            Paid Bills
          </span>
          <span className="font-display text-sm font-bold text-body">
            {revenueSummary?.totalBills ?? 0}
          </span>
        </div>

        <div className="flex flex-col rounded-xl bg-canvas p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-body-muted">
            <Receipt className="h-3 w-3 text-body-faint" />
            Tax (VAT)
          </span>
          <span className="font-display text-sm font-bold text-body">
            {money(totalVat)}
          </span>
        </div>

        <div className="flex flex-col rounded-xl bg-canvas p-2.5">
          <span className="flex items-center gap-1 text-[11px] text-body-muted">
            <Percent className="h-3 w-3 text-body-faint" />
            Discounts
          </span>
          <span className="font-display text-sm font-bold text-body">
            {money(totalDiscount)}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="pt-2">
        <LineChart
          data={chartData}
          formatValue={money}
          color="#059669"
          gradientId="revenue-emerald-gradient"
          emptyMessage="No billing revenue recorded for this period"
        />
      </div>
    </div>
  )
}

