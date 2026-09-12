import { useState } from 'react'
import { Wallet, ShoppingBag, CalendarCheck, FileSpreadsheet } from 'lucide-react'
import { money } from '@/utils/format'

export function ReportBreakdownTable({
  ordersSummary,
  revenueSummary,
  reservationsSummary,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('revenue') // 'revenue' | 'orders' | 'reservations'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-5">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="skeleton h-32 w-full rounded-xl" />
      </div>
    )
  }

  const revenueRows = revenueSummary?.series ?? []
  const orderRows = ordersSummary?.series ?? []
  const reservationStatus = reservationsSummary?.byStatus ?? {}
  const reservationTotal = reservationsSummary?.total ?? 0

  const reservationRows = Object.entries(reservationStatus).map(([status, count]) => ({
    status,
    count,
    percentage: reservationTotal > 0 ? Math.round((count / reservationTotal) * 100) : 0,
  }))

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-rule pb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-body-muted" />
          <h3 className="font-display text-base font-bold text-body">
            Detailed Periodic Breakdown
          </h3>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 rounded-xl border border-rule bg-canvas p-1">
          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'revenue'
                ? 'bg-card text-body shadow-sm ring-1 ring-rule'
                : 'text-body-muted hover:text-body'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            Revenue ({revenueRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-card text-body shadow-sm ring-1 ring-rule'
                : 'text-body-muted hover:text-body'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Orders ({orderRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'reservations'
                ? 'bg-card text-body shadow-sm ring-1 ring-rule'
                : 'text-body-muted hover:text-body'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            Reservations ({reservationRows.length})
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="overflow-x-auto">
        {activeTab === 'revenue' ? (
          revenueRows.length === 0 ? (
            <div className="py-8 text-center text-xs text-body-muted">
              No revenue logs recorded for the selected period.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rule text-body-muted">
                  <th className="py-2.5 px-3 font-semibold">
                    {revenueSummary?.granularity === 'day' ? 'Date' : 'Month Period'}
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {revenueRows.map((row) => (
                  <tr key={row.label} className="transition-colors hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-medium text-body">{row.label}</td>
                    <td className="py-2.5 px-3 font-bold text-right text-emerald-600 dark:text-emerald-400">
                      {money(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : activeTab === 'orders' ? (
          orderRows.length === 0 ? (
            <div className="py-8 text-center text-xs text-body-muted">
              No order activity recorded for the selected period.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rule text-body-muted">
                  <th className="py-2.5 px-3 font-semibold">
                    {ordersSummary?.granularity === 'day' ? 'Date' : 'Month Period'}
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">Orders Count</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {orderRows.map((row) => (
                  <tr key={row.label} className="transition-colors hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-medium text-body">{row.label}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-body">
                      {row.orderCount}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-right text-body">
                      {money(row.orderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-rule text-body-muted">
                <th className="py-2.5 px-3 font-semibold">Booking Status</th>
                <th className="py-2.5 px-3 font-semibold text-center">Count</th>
                <th className="py-2.5 px-3 font-semibold text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {reservationRows.map((row) => (
                <tr key={row.status} className="transition-colors hover:bg-canvas/50">
                  <td className="py-2.5 px-3 font-medium text-body">{row.status}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-body">{row.count}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-body-muted">
                    {row.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

