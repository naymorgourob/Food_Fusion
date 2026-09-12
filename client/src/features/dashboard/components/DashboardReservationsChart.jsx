import { Link } from 'react-router-dom'
import { CalendarCheck, Users, ChevronRight } from 'lucide-react'
import { BarChart } from '@/features/reports/components/BarChart'

const STATUS_META = [
  { key: 'CONFIRMED', label: 'Confirmed', color: '#10b981' }, // emerald
  { key: 'PENDING', label: 'Pending', color: '#f59e0b' },   // amber
  { key: 'COMPLETED', label: 'Completed', color: '#3b82f6' }, // blue
  { key: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }, // red
]

export function DashboardReservationsChart({ reservationsSummary, isLoading }) {
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

  const chartData = STATUS_META.map((meta) => ({
    label: meta.label,
    shortLabel: meta.label,
    value: reservationsSummary?.byStatus?.[meta.key] ?? 0,
  }))

  const totalReservations = reservationsSummary?.total ?? 0
  const totalGuests = reservationsSummary?.totalGuests ?? 0
  const confirmedCount = reservationsSummary?.byStatus?.CONFIRMED ?? 0
  const pendingCount = reservationsSummary?.byStatus?.PENDING ?? 0

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-rule/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Reservations by Status
            </h3>
            <span className="text-xs text-body-faint">
              Booking status distribution & seated covers
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/reservations"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
        >
          View Bookings <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Highlights Bar */}
      <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-rule bg-canvas/60 p-3 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Total Bookings</span>
          <span className="font-mono text-sm font-bold text-body">{totalReservations}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Guest Covers</span>
          <span className="font-mono text-sm font-bold text-body">{totalGuests} seated</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Confirmed</span>
          <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {confirmedCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-body-faint">Pending Approval</span>
          <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="pt-2">
        <BarChart
          data={chartData}
          formatValue={(val) => `${val} bookings`}
          barColors={STATUS_META.map((m) => m.color)}
          showAllValueLabels
          emptyMessage="No reservations recorded for this period."
        />
      </div>
    </div>
  )
}

