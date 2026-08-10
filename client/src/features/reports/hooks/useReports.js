import { useEffect, useState } from 'react'
import {
  fetchDashboardStats,
  fetchOrdersSummary,
  fetchReservationsSummary,
  fetchRevenueSummary,
} from '@/features/reports/services/reportService'

// One hook fetches all four report pieces together whenever the filter
// changes — dashboard-stats is filter-independent but cheap (a handful of
// COUNTs) so refetching it alongside the rest keeps this hook a single,
// simple effect instead of two hooks the page has to coordinate.
export function useReports(queryParams) {
  const [stats, setStats] = useState(null)
  const [ordersSummary, setOrdersSummary] = useState(null)
  const [reservationsSummary, setReservationsSummary] = useState(null)
  const [revenueSummary, setRevenueSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const { date, month, year } = queryParams

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const params = { date, month, year }
        const [statsData, orders, reservations, revenue] = await Promise.all([
          fetchDashboardStats(),
          fetchOrdersSummary(params),
          fetchReservationsSummary(params),
          fetchRevenueSummary(params),
        ])
        if (!cancelled) {
          setStats(statsData)
          setOrdersSummary(orders)
          setReservationsSummary(reservations)
          setRevenueSummary(revenue)
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load reports.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [date, month, year])

  return { stats, ordersSummary, reservationsSummary, revenueSummary, isLoading, error }
}
