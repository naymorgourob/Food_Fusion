import { useState } from 'react'
import { Users, ChefHat, UtensilsCrossed, ClipboardList, CalendarCheck, Wallet, Boxes } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { ReportFilters } from '@/features/reports/components/ReportFilters'
import { ChartCard } from '@/features/reports/components/ChartCard'
import { BarChart } from '@/features/reports/components/BarChart'
import { LineChart } from '@/features/reports/components/LineChart'
import { useReports } from '@/features/reports/hooks/useReports'

const RESERVATION_STATUS_META = [
  { key: 'PENDING', label: 'Pending', color: 'var(--color-warning)' },
  { key: 'CONFIRMED', label: 'Confirmed', color: 'var(--color-info)' },
  { key: 'CANCELLED', label: 'Cancelled', color: 'var(--color-danger)' },
  { key: 'COMPLETED', label: 'Completed', color: 'var(--color-success)' },
]

const money = (value) => `$${Number(value).toFixed(2)}`

// 'YYYY-MM-DD' -> 'Jul 5' · 'YYYY-MM' -> 'Jul' — the raw bucket label from
// the API is exact (good for the table), this is only for chart axes.
function shortLabelFor(label, granularity) {
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

// Admin-only (see App.jsx) — this part's Authorization section grants no
// other role any access to this module.
export default function ReportsPage() {
  const now = new Date()
  const [filters, setFilters] = useState({ mode: 'year', year: now.getFullYear(), month: now.getMonth() + 1, date: '' })

  const queryParams =
    filters.mode === 'date'
      ? { date: filters.date || undefined }
      : filters.mode === 'month'
        ? { year: filters.year, month: filters.month }
        : { year: filters.year }

  const { stats, ordersSummary, reservationsSummary, revenueSummary, isLoading } = useReports(queryParams)

  function updateFilters(partial) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  const orderChartData = (ordersSummary?.series ?? []).map((bucket) => ({
    label: bucket.label,
    shortLabel: shortLabelFor(bucket.label, ordersSummary.granularity),
    value: bucket.orderCount,
  }))

  const revenueChartData = (revenueSummary?.series ?? []).map((bucket) => ({
    label: bucket.label,
    shortLabel: shortLabelFor(bucket.label, revenueSummary.granularity),
    value: bucket.revenue,
  }))

  const reservationChartData = RESERVATION_STATUS_META.map((meta) => ({
    label: meta.label,
    value: reservationsSummary?.byStatus?.[meta.key] ?? 0,
  }))

  const ordersTitle = ordersSummary?.granularity === 'day' ? 'Daily Orders' : 'Monthly Orders'
  const revenueTitle = revenueSummary?.granularity === 'day' ? 'Daily Revenue' : 'Monthly Revenue'

  const orderColumns = [
    { key: 'label', header: ordersSummary?.granularity === 'day' ? 'Date' : 'Month' },
    { key: 'orderCount', header: 'Orders' },
    { key: 'orderValue', header: 'Order Value', render: (row) => money(row.orderValue) },
  ]

  const revenueColumns = [
    { key: 'label', header: revenueSummary?.granularity === 'day' ? 'Date' : 'Month' },
    { key: 'revenue', header: 'Revenue', render: (row) => money(row.revenue) },
  ]

  const reservationColumns = [
    { key: 'label', header: 'Status' },
    { key: 'value', header: 'Count' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <ReportFilters filters={filters} onChange={updateFilters} />

      <section aria-labelledby="stats-heading" className="flex flex-col gap-4">
        <h2 id="stats-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard icon={Users} title="Total Customers" value={stats?.totalCustomers ?? '—'} />
          <StatCard icon={ChefHat} title="Total Staff" value={stats?.totalStaff ?? '—'} />
          <StatCard icon={UtensilsCrossed} title="Total Menu Items" value={stats?.totalMenuItems ?? '—'} />
          <StatCard icon={ClipboardList} title="Total Orders" value={stats?.totalOrders ?? '—'} />
          <StatCard icon={CalendarCheck} title="Total Reservations" value={stats?.totalReservations ?? '—'} />
          <StatCard icon={Wallet} title="Total Revenue" value={stats ? money(stats.totalRevenue) : '—'} />
          <StatCard icon={Boxes} title="Total Inventory Items" value={stats?.totalInventoryItems ?? '—'} />
        </div>
      </section>

      <section aria-labelledby="charts-heading" className="flex flex-col gap-4">
        <h2 id="charts-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Charts
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title={ordersTitle}>
            <BarChart data={orderChartData} formatValue={(value) => `${value} orders`} />
          </ChartCard>
          <ChartCard title={revenueTitle}>
            <LineChart data={revenueChartData} formatValue={money} />
          </ChartCard>
          <ChartCard title="Reservation Summary">
            <BarChart
              data={reservationChartData}
              formatValue={(value) => `${value} reservations`}
              barColors={RESERVATION_STATUS_META.map((meta) => meta.color)}
              showAllValueLabels
            />
          </ChartCard>
        </div>
      </section>

      <section aria-labelledby="tables-heading" className="flex flex-col gap-4">
        <h2 id="tables-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Summary Tables
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DataTable
            columns={orderColumns}
            rows={ordersSummary?.series ?? []}
            getRowKey={(row) => row.label}
            isLoading={isLoading}
            emptyMessage="No orders in this period."
            minWidth={280}
          />
          <DataTable
            columns={revenueColumns}
            rows={revenueSummary?.series ?? []}
            getRowKey={(row) => row.label}
            isLoading={isLoading}
            emptyMessage="No revenue in this period."
            minWidth={280}
          />
          <DataTable
            columns={reservationColumns}
            rows={reservationChartData}
            getRowKey={(row) => row.label}
            isLoading={isLoading}
            emptyMessage="No reservations in this period."
            minWidth={280}
          />
        </div>
      </section>
    </div>
  )
}
