import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ClipboardList, SearchX } from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { AdminOrderRow } from '@/features/orders/components/AdminOrderRow'
import { AdminOrderDrawer } from '@/features/orders/components/AdminOrderDrawer'
import { useOrders } from '@/features/orders/hooks/useOrders'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal } from '@/features/orders/constants'
import { orderNo } from '@/utils/format'
import {
  ORDER_STATUS_FILTERS,
  ORDER_TYPE_FILTERS,
  PAYMENT_STATUS_FILTERS,
  DATE_FILTERS,
  SORT_OPTIONS,
  filterOrders,
  sortOrders,
} from '@/features/orders/adminOrderHelpers'

/**
 * Admin Order Management (UI-08.4 redesign).
 *
 * Replaces a plain DataTable (no search, no filters at all) with the
 * search/filter/row vocabulary established across the redesigned Menu
 * and Category Management modules (UI-08.1/08.2) — same emerald/gold
 * system, same skeleton and empty-state patterns, applied to Orders.
 * Shared with Staff at this same route (both roles pass through
 * authorizeStaffOrAdmin on every order endpoint) — Staff also has their
 * own dedicated /staff/orders (UI-07), which is untouched by this file.
 *
 * Data and every mutation are unchanged: useOrders, and
 * updateOrderStatus/assignStaff/updateEstimatedTime/cancelOrder from
 * orderService are called exactly as before. GET /orders has no query
 * parameters at all (see the design note on adminOrderHelpers.js), so
 * search/filter/sort are applied to the one full result set the hook
 * already fetches — not a new endpoint.
 */
export default function OrdersPage() {
  const { orders, isLoading, error, refetch } = useOrders()

  const [assignableStaff, setAssignableStaff] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [viewingOrder, setViewingOrder] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)
  const [isUpdatingEstimatedTime, setIsUpdatingEstimatedTime] = useState(false)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    orderService.fetchAssignableStaff().then(setAssignableStaff).catch(() => setAssignableStaff([]))
  }, [])

  const filtered = useMemo(
    () =>
      filterOrders(orders, {
        search: searchTerm,
        status: statusFilter,
        orderType: typeFilter,
        paymentStatus: paymentFilter,
        date: dateFilter,
      }),
    [orders, searchTerm, statusFilter, typeFilter, paymentFilter, dateFilter],
  )

  const sorted = useMemo(() => sortOrders(filtered, sortBy, orderGrandTotal), [filtered, sortBy])

  async function handleStatusChange(status) {
    setIsUpdatingStatus(true)
    try {
      const updated = await orderService.updateOrderStatus(viewingOrder.id, status)
      setViewingOrder(updated)
      refetch()
    } catch {
      refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleAssignStaff(staffId) {
    setIsAssigningStaff(true)
    try {
      const updated = await orderService.assignStaff(viewingOrder.id, staffId)
      setViewingOrder(updated)
      refetch()
    } catch {
      refetch()
    } finally {
      setIsAssigningStaff(false)
    }
  }

  async function handleUpdateEstimatedTime(payload) {
    setIsUpdatingEstimatedTime(true)
    try {
      const updated = await orderService.updateEstimatedTime(viewingOrder.id, payload)
      setViewingOrder(updated)
      refetch()
    } catch {
      refetch()
    } finally {
      setIsUpdatingEstimatedTime(false)
    }
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      await orderService.cancelOrder(cancelTarget.id)
      setCancelTarget(null)
      refetch()
    } catch (error) {
      setCancelError(error.response?.data?.message ?? 'Failed to cancel order.')
    } finally {
      setIsCancelling(false)
    }
  }

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (typeFilter ? 1 : 0) + (paymentFilter ? 1 : 0) + (dateFilter ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setPaymentFilter('')
    setDateFilter('')
    setSortBy('newest')
    setFiltersOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Header ------------------------------------------------------ */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Orders</h1>
        <p className="text-sm text-body-muted">
          {isLoading ? 'Loading…' : `${sorted.length} of ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
        </p>
      </div>

      {/* --- Search + filters ---------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search order # or customer…"
            aria-label="Search orders"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="inline-flex flex-none items-center justify-center gap-2 rounded-full border border-rule bg-card px-5 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[0.65rem] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rule bg-card p-4">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by order status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {ORDER_STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter by order type"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {ORDER_TYPE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                aria-label="Filter by payment status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {PAYMENT_STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by date"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {DATE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort orders"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-auto text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- List ----------------------------------------------------------- */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-rule bg-card p-4">
              <div className="skeleton h-5 w-full rounded" aria-hidden />
            </div>
          ))}
          <span className="sr-only">Loading orders…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 px-6 py-16 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
            <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
            {isFiltered ? (
              <SearchX className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            ) : (
              <ClipboardList className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            )}
          </span>
          <p className="font-display text-base font-semibold text-body">
            {isFiltered ? 'No orders match your filters' : 'No orders yet'}
          </p>
          <p className="max-w-xs text-sm text-body-muted">
            {isFiltered
              ? 'Try a different search term, or clear your filters to see every order.'
              : 'Orders will appear here as customers place them.'}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {sorted.map((order) => (
              <AdminOrderRow
                key={order.id}
                order={order}
                onView={setViewingOrder}
                onCancel={(row) => {
                  setCancelError('')
                  setCancelTarget(row)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AdminOrderDrawer
        key={viewingOrder?.id ?? 'none'}
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
        assignableStaff={assignableStaff}
        onAssignStaff={handleAssignStaff}
        isAssigningStaff={isAssigningStaff}
        onUpdateEstimatedTime={handleUpdateEstimatedTime}
        isUpdatingEstimatedTime={isUpdatingEstimatedTime}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Cancel ${cancelTarget ? orderNo(cancelTarget.orderNumber) : ''}? This cannot be undone.`}
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep Order"
        confirmLabel="Cancel Order"
        confirmingLabel="Cancelling…"
      />
    </div>
  )
}
