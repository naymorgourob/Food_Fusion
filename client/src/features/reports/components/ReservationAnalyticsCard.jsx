import { CalendarCheck, Users, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { BarChart } from '@/features/reports/components/BarChart'

const STATUS_CONFIG = [
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    color: '#059669', // emerald-600
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    color: '#3b82f6', // blue-500
    icon: CheckCircle2,
    badge: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
  },
  {
    key: 'PENDING',
    label: 'Pending',
    color: '#d97706', // amber-600
    icon: Clock,
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  },
  {
    key: 'CANCELLED',
    label: 'Cancelled',
    color: '#94a3b8', // slate-400
    icon: XCircle,
    badge: 'bg-surface-2 text-body-muted',
  },
]

export function ReservationAnalyticsCard({ reservationsSummary, isLoading }) {
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

  const total = reservationsSummary?.total ?? 0
  const totalGuests = reservationsSummary?.totalGuests ?? 0
  const avgPartySize = total > 0 ? (totalGuests / total).toFixed(1) : '0.0'
  const byStatus = reservationsSummary?.byStatus ?? {}

  const chartData = STATUS_CONFIG.map((c) => ({
    label: c.label,
    shortLabel: c.label,
    value: byStatus[c.key] ?? 0,
  }))

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold text-body">
              Reservation Summary
            </h3>
            <span className="text-xs text-body-faint">
              Booking fulfillment and table demand
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-body-muted">Bookings:</span>
          <span className="font-display text-xl font-bold text-body">
            {total} {total === 1 ? 'booking' : 'bookings'}
          </span>
        </div>
      </div>

      {/* Guest capacity metrics strip */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-xl bg-canvas p-3 text-xs">
          <span className="flex items-center gap-1.5 text-body-muted">
            <Users className="h-3.5 w-3.5 text-brand-600" />
            Total Covers (Guests)
          </span>
          <span className="font-display text-sm font-bold text-body">
            {totalGuests}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-canvas p-3 text-xs">
          <span className="flex items-center gap-1.5 text-body-muted">
            <Users className="h-3.5 w-3.5 text-gold-600" />
            Avg. Party Size
          </span>
          <span className="font-display text-sm font-bold text-body">
            {avgPartySize} guests
          </span>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="pt-1">
        <BarChart
          data={chartData}
          formatValue={(val) => `${val} bookings`}
          barColors={STATUS_CONFIG.map((c) => c.color)}
          showAllValueLabels
          emptyMessage="No reservations recorded for this time frame"
        />
      </div>

      {/* Status Breakdown Pills */}
      <div className="grid grid-cols-2 gap-2 border-t border-rule pt-4 sm:grid-cols-4">
        {STATUS_CONFIG.map((c) => {
          const count = byStatus[c.key] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div
              key={c.key}
              className="flex flex-col gap-1 rounded-xl border border-rule bg-card/60 p-2.5 text-center"
            >
              <span className="text-[11px] font-semibold text-body-muted">{c.label}</span>
              <span className="font-display text-base font-bold text-body leading-none">
                {count}
              </span>
              <span className="text-[10px] text-body-faint font-medium">{pct}% of total</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

