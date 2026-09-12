import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, ChevronRight } from 'lucide-react'
import { LineChart } from '@/features/reports/components/LineChart'
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

export function DashboardRevenueChart({ revenueSummary, isLoading }) {
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

  const series = revenueSummary?.series ?? []
  const chartData = series.map((bucket) => ({
    label: bucket.label,
    shortLabel: formatShortDate(bucket.label, revenueSummary?.granularity),
    value: bucket.revenue,
  }))

  const totalRevenue = revenueSummary?.totalRevenue ?? 0
  const avgBill = revenueSummary?.averageBillValue ?? 0
  const totalBills = revenueSummary?.totalBills ?? 0
  const totalVat = revenueSummary?.totalVat ?? 0

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-rule/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Revenue Performance
            </h3>
            <span className="text-xs text-body-faint">
              Paid invoices billed across current cycle
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/reports"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
        >
          View Full Report <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Snapshot metrics bar */}
      <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-rule bg-canvas/60 p-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Gross Revenue</span>
          <span className="font-mono text-sm font-bold text-body">{money(totalRevenue)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Paid Bills</span>
          <span className="font-mono text-sm font-bold text-body">{totalBills} settled</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Avg Ticket Size</span>
          <span className="font-mono text-sm font-bold text-body">{money(avgBill)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Collected VAT</span>
          <span className="font-mono text-sm font-bold text-body">{money(totalVat)}</span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="pt-2">
        <LineChart
          data={chartData}
          formatValue={money}
          color="#10b981"
          gradientId="dashboard-revenue-gradient"
          emptyMessage="No revenue collected for this period."
        />
      </div>
    </div>
  )
}

