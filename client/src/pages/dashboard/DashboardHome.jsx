import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchDashboardStats,
  fetchOrdersSummary,
  fetchRevenueSummary,
  fetchReservationsSummary,
} from '@/features/reports/services/reportService'
import { fetchOrders } from '@/features/orders/services/orderService'
import { fetchCustomers } from '@/features/customers/services/customerService'
import { fetchReservations } from '@/features/reservations/services/reservationService'
import { fetchTables } from '@/features/tables/services/tableService'
import { fetchInventoryItems } from '@/features/inventory/services/inventoryService'
import { orderGrandTotal } from '@/features/orders/constants'

// Redesigned dashboard feature components
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { DashboardKpiCards } from '@/features/dashboard/components/DashboardKpiCards'
import { LiveOperationsPulse } from '@/features/dashboard/components/LiveOperationsPulse'
import { DashboardQuickActions } from '@/features/dashboard/components/DashboardQuickActions'
import { DashboardRevenueChart } from '@/features/dashboard/components/DashboardRevenueChart'
import { DashboardOrdersChart } from '@/features/dashboard/components/DashboardOrdersChart'
import { DashboardReservationsChart } from '@/features/dashboard/components/DashboardReservationsChart'
import { RecentOrdersCard } from '@/features/dashboard/components/RecentOrdersCard'
import { RecentReservationsCard } from '@/features/dashboard/components/RecentReservationsCard'
import { RecentCustomersCard } from '@/features/dashboard/components/RecentCustomersCard'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Admin Dashboard Home (UI-08.11 Final Redesign).
 *
 * Central command center for FoodFusion management:
 * - Real backend data from all restaurant modules & reporting aggregations
 * - Dynamic executive KPI metrics with real-time day/all-time comparisons
 * - Live Operations Pulse: Kitchen pipeline, Table floor occupancy, and Inventory warnings
 * - Operations Launchpad: direct navigation to all functional modules
 * - Revenue performance line chart with financial breakdown
 * - Order volume & service mix fulfillment analytics
 * - Reservation booking distribution & seated covers analytics
 * - Live recent activity feeds: Orders, Bookings, and Diners
 * - Graceful error degradation and skeletons for zero-flicker loading
 */
export default function DashboardHome() {
  const { user } = useAuth()

  // Primary data states
  const [stats, setStats] = useState(null)
  const [ordersSummary, setOrdersSummary] = useState(null)
  const [revenueSummary, setRevenueSummary] = useState(null)
  const [reservationsSummary, setReservationsSummary] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [allCustomers, setAllCustomers] = useState([])
  const [allReservations, setAllReservations] = useState([])
  const [tables, setTables] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])

  // Lifecycle states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      setIsLoading(true)
      setError(null)

      try {
        const currentYear = new Date().getFullYear()

        const [
          dashboardStats,
          ordersSum,
          revenueSum,
          reservationsSum,
          ordersData,
          customersData,
          reservationsData,
          tablesData,
          inventoryData,
        ] = await Promise.all([
          fetchDashboardStats().catch(() => null),
          fetchOrdersSummary({ year: currentYear }).catch(() => null),
          fetchRevenueSummary({ year: currentYear }).catch(() => null),
          fetchReservationsSummary({ year: currentYear }).catch(() => null),
          fetchOrders().catch(() => []),
          fetchCustomers().catch(() => []),
          fetchReservations().catch(() => []),
          fetchTables().catch(() => []),
          fetchInventoryItems().catch(() => []),
        ])

        if (cancelled) return

        setStats(dashboardStats)
        setOrdersSummary(ordersSum)
        setRevenueSummary(revenueSum)
        setReservationsSummary(reservationsSum)
        setAllOrders(ordersData)
        setAllCustomers(customersData)
        setAllReservations(reservationsData)
        setTables(tablesData)
        setInventoryItems(inventoryData)

        setLastUpdated(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        )
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message ?? 'Failed to load restaurant dashboard data.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()
    return () => {
      cancelled = true
    }
  }, [refetchIndex])

  // Computed metrics for today
  const today = useMemo(() => startOfToday(), [])

  const todaysOrders = useMemo(
    () => allOrders.filter((order) => new Date(order.createdAt) >= today),
    [allOrders, today]
  )

  const todayOrdersCount = todaysOrders.length

  const todaySales = useMemo(
    () => todaysOrders.reduce((sum, order) => sum + orderGrandTotal(order), 0),
    [todaysOrders]
  )

  const upcomingReservationsCount = useMemo(
    () =>
      allReservations.filter(
        (r) => new Date(r.reservationDate) >= today && r.status !== 'CANCELLED'
      ).length,
    [allReservations, today]
  )

  // Kitchen queue pipeline breakdown
  const pendingOrdersCount = useMemo(
    () => allOrders.filter((o) => o.status === 'PENDING').length,
    [allOrders]
  )

  const prepOrdersCount = useMemo(
    () => allOrders.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status)).length,
    [allOrders]
  )

  const readyOrdersCount = useMemo(
    () => allOrders.filter((o) => ['READY', 'ON_THE_WAY', 'SERVED'].includes(o.status)).length,
    [allOrders]
  )

  function handleRefresh() {
    setRefetchIndex((i) => i + 1)
  }

  return (
    <div className="flex flex-col gap-9 pb-10">
      {/* ── 1. Hero Header ────────────────────────────────────────── */}
      <DashboardHeader
        user={user}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
      />

      {/* ── 2. Error Banner (if any) ──────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 flex-none text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-xs hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-200"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Executive KPI Cards ────────────────────────────────── */}
      <section className="flex flex-col gap-3" aria-labelledby="dashboard-overview-heading">
        <SectionLabel
          id="dashboard-overview-heading"
          title="Today's overview"
          description="The numbers that need your attention first"
        />
        <DashboardKpiCards
          stats={stats}
          todaySales={todaySales}
          todayOrdersCount={todayOrdersCount}
          upcomingReservationsCount={upcomingReservationsCount}
          totalGuestsCount={reservationsSummary?.totalGuests ?? 0}
          pendingOrdersCount={pendingOrdersCount}
          prepOrdersCount={prepOrdersCount}
          isLoading={isLoading}
        />
      </section>

      {/* ── 4. Live Floor & Kitchen Operations Pulse ──────────────── */}
      <section className="flex flex-col gap-3" aria-labelledby="dashboard-operations-heading">
        <SectionLabel
          id="dashboard-operations-heading"
          title="Live operations"
          description="Kitchen, floor, and stock status at a glance"
        />
        <LiveOperationsPulse
          pendingOrdersCount={pendingOrdersCount}
          prepOrdersCount={prepOrdersCount}
          readyOrdersCount={readyOrdersCount}
          tables={tables}
          inventoryItems={inventoryItems}
          isLoading={isLoading}
        />
      </section>

      {/* ── 5. Operations Launchpad / Quick Actions ───────────────── */}
      <DashboardQuickActions />

      {/* ── 6. Analytics Visualizations Grid ──────────────────────── */}
      <section className="flex flex-col gap-3.5" aria-labelledby="dashboard-analytics-heading">
        <SectionLabel
          id="dashboard-analytics-heading"
          title="Business performance"
          description="Revenue, order volume, and reservation trends"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Performance Chart */}
          <DashboardRevenueChart
            revenueSummary={revenueSummary}
            isLoading={isLoading}
          />

          {/* Orders Volume & Mix Chart */}
          <DashboardOrdersChart
            ordersSummary={ordersSummary}
            isLoading={isLoading}
          />
        </div>

        {/* Reservation Status Distribution */}
        <div className="grid grid-cols-1">
          <DashboardReservationsChart
            reservationsSummary={reservationsSummary}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* ── 7. Live Activity Audit Feeds ──────────────────────────── */}
      <section className="flex flex-col gap-3.5" aria-labelledby="dashboard-activity-heading">
        <SectionLabel
          id="dashboard-activity-heading"
          title="Recent activity"
          description="The latest orders, bookings, and diner registrations"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <RecentOrdersCard orders={allOrders} isLoading={isLoading} />

          {/* Recent Reservations */}
          <RecentReservationsCard
            reservations={allReservations}
            isLoading={isLoading}
          />

          {/* Recent Diners */}
          <RecentCustomersCard customers={allCustomers} isLoading={isLoading} />
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ id, title, description }) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-brand-600 pl-3 dark:border-brand-400 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <h2 id={id} className="font-display text-sm font-bold tracking-wide text-body">
        {title}
      </h2>
      <p className="text-xs text-body-muted">{description}</p>
    </div>
  )
}
