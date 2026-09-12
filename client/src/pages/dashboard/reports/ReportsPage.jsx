import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { useReports } from '@/features/reports/hooks/useReports'
import { ReportFilters } from '@/features/reports/components/ReportFilters'
import { OverviewKpiGrid } from '@/features/reports/components/OverviewKpiGrid'
import { RevenueAnalyticsCard } from '@/features/reports/components/RevenueAnalyticsCard'
import { OrderAnalyticsCard } from '@/features/reports/components/OrderAnalyticsCard'
import { ReservationAnalyticsCard } from '@/features/reports/components/ReservationAnalyticsCard'
import { ReportBreakdownTable } from '@/features/reports/components/ReportBreakdownTable'

export default function ReportsPage() {
  const now = new Date()
  const [filters, setFilters] = useState({
    mode: 'year',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    date: '',
  })

  const queryParams =
    filters.mode === 'date'
      ? { date: filters.date || undefined }
      : filters.mode === 'month'
      ? { year: filters.year, month: filters.month }
      : { year: filters.year }

  const {
    stats,
    ordersSummary,
    reservationsSummary,
    revenueSummary,
    isLoading,
    error,
    refetch,
  } = useReports(queryParams)

  function updateFilters(partial) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function handleResetFilters() {
    setFilters({
      mode: 'year',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: '',
    })
  }

  const periodLabel =
    filters.mode === 'date' && filters.date
      ? new Date(filters.date).toLocaleDateString([], {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : filters.mode === 'month'
      ? `${new Date(2000, filters.month - 1).toLocaleDateString([], {
          month: 'long',
        })} ${filters.year}`
      : `Full Year ${filters.year}`

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-body">Reports & Analytics</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-rule bg-canvas px-2.5 py-1 text-xs font-semibold text-body-muted">
              <Calendar className="h-3 w-3 text-brand-600" />
              {periodLabel}
            </span>
          </div>
          <p className="text-sm text-body-muted">
            Track business revenue, dining orders, reservation volume, and guest trends.
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={isLoading}
          className="inline-flex flex-none items-center justify-center gap-2 rounded-full border border-rule bg-card px-4 py-2 text-xs font-semibold text-body shadow-xs transition-all hover:bg-canvas hover:text-brand-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-none" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg bg-red-100 px-3 py-1 font-semibold hover:bg-red-200 dark:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Reporting Period Filters ───────────────────────────────── */}
      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* ── Top Level Overview KPIs ────────────────────────────────── */}
      <OverviewKpiGrid
        stats={stats}
        ordersSummary={ordersSummary}
        revenueSummary={revenueSummary}
        reservationsSummary={reservationsSummary}
        isLoading={isLoading}
      />

      {/* ── Main Visualizations (Revenue & Reservations) ──────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueAnalyticsCard revenueSummary={revenueSummary} isLoading={isLoading} />
        <ReservationAnalyticsCard reservationsSummary={reservationsSummary} isLoading={isLoading} />
      </div>

      {/* ── Order Analytics & Trends ───────────────────────────────── */}
      <OrderAnalyticsCard ordersSummary={ordersSummary} isLoading={isLoading} />

      {/* ── Detailed Breakdown Table ───────────────────────────────── */}
      <ReportBreakdownTable
        ordersSummary={ordersSummary}
        revenueSummary={revenueSummary}
        reservationsSummary={reservationsSummary}
        isLoading={isLoading}
      />
    </div>
  )
}
