import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  ListFilter,
  Users,
  SearchX,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { CustomerStatsSummary } from '@/features/customers/components/CustomerStatsSummary'
import { AdminCustomerRow } from '@/features/customers/components/AdminCustomerRow'
import { AdminCustomerDrawer } from '@/features/customers/components/AdminCustomerDrawer'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import * as customerService from '@/features/customers/services/customerService'
import {
  STATUS_FILTERS,
  SORT_OPTIONS,
  filterCustomers,
  sortCustomers,
} from '@/features/customers/customerHelpers'

/**
 * Admin Customer Management (UI-08.7 redesign).
 *
 * Features:
 * - Real PostgreSQL data loaded via existing `/customers` & `/customers/:id` APIs.
 * - Interactive metric summary bar (Total, Active, Inactive, Lifetime orders).
 * - Instant client-side search by name, email, or phone.
 * - Status filtering (Active / Inactive / All) with click-to-filter stat cards.
 * - Sorting by newest, oldest, name, or highest order count.
 * - Animated responsive customer cards/rows with avatar initials, contact info, and activity counters.
 * - Slide-in detail drawer featuring contact card, copy email, phone call, recent orders,
 *   reservations, and loyalty transaction history.
 * - Account activation / deactivation with safety confirmation dialog.
 */
export default function CustomersPage() {
  const { customers, isLoading, error, refetch } = useCustomers()

  // Filter & sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Drawer state
  const [viewingCustomer, setViewingCustomer] = useState(null)

  // Status toggle & confirmation state
  const [statusTarget, setStatusTarget] = useState(null)
  const [isToggling, setIsToggling] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Filtered & sorted customer list
  const filtered = useMemo(
    () => filterCustomers(customers, { search: searchTerm, status: statusFilter }),
    [customers, searchTerm, statusFilter],
  )
  const sorted = useMemo(() => sortCustomers(filtered, sortBy), [filtered, sortBy])

  const activeFilterCount = (statusFilter ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || Boolean(statusFilter) || sortBy !== 'newest'

  function handleStatCardFilter(status) {
    setStatusFilter(status)
  }

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setSortBy('newest')
  }

  function promptToggleStatus(customer) {
    setStatusError('')
    setStatusTarget(customer)
  }

  async function handleConfirmToggleStatus() {
    if (!statusTarget) return
    setIsToggling(true)
    setStatusError('')

    const nextStatus = !statusTarget.isActive

    try {
      await customerService.updateCustomerStatus(statusTarget.id, nextStatus)
      setFeedbackMessage({
        type: 'success',
        text: nextStatus
          ? `${statusTarget.fullName}'s account has been successfully activated.`
          : `${statusTarget.fullName}'s account has been deactivated.`,
      })
      setTimeout(() => setFeedbackMessage(null), 4000)

      // If drawer is currently open for this customer, update state
      if (viewingCustomer?.id === statusTarget.id) {
        setViewingCustomer((prev) => (prev ? { ...prev, isActive: nextStatus } : null))
      }

      setStatusTarget(null)
      refetch()
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update customer status.')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold text-body">Customer Directory</h1>
          <span className="flex h-6 items-center justify-center rounded-full bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            {customers.length} registered
          </span>
        </div>
        <p className="text-sm text-body-muted">
          Manage customer accounts, monitor guest activity, and view lifetime orders and bookings.
        </p>
      </div>

      {/* ── Feedback Notification ──────────────────────────────────── */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              feedbackMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-none text-red-600 dark:text-red-400" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Metrics Summary Bar ────────────────────────────────────── */}
      <CustomerStatsSummary
        customers={customers}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={handleStatCardFilter}
      />

      {/* ── Search & Filter Controls ───────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, or phone…"
            aria-label="Search customers"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        {/* Sort selector */}
        <div className="relative flex-none">
          <ListFilter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort customers"
            className="rounded-full border border-rule bg-card py-2.5 pr-4 pl-9 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expandable filters trigger */}
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

      {/* ── Expanded Filter Tray ───────────────────────────────────── */}
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
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by account status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {STATUS_FILTERS.map((option) => (
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
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results List ───────────────────────────────────────────── */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-rule bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="skeleton h-11 w-11 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
              </div>
              <div className="skeleton h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        isFiltered ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-body-faint">
              <SearchX className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-body">No customers found</h3>
              <p className="max-w-sm text-xs text-body-muted">
                No customer matches your search or active filter criteria. Try adjusting your query or resetting filters.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 rounded-full border border-rule bg-card px-4 py-2 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-body-faint">
              <Users className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-body">No customers yet</h3>
              <p className="max-w-sm text-xs text-body-muted">
                Customers who register on FoodFusion will appear here automatically.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-body-muted px-1">
            <span>
              Showing <strong className="text-body font-semibold">{sorted.length}</strong> of{' '}
              <strong className="text-body font-semibold">{customers.length}</strong> customers
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-brand-700 hover:underline dark:text-brand-400"
              >
                Reset
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {sorted.map((customer) => (
              <AdminCustomerRow
                key={customer.id}
                customer={customer}
                onView={(c) => setViewingCustomer(c)}
                onToggleStatus={promptToggleStatus}
                isToggling={isToggling && statusTarget?.id === customer.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Slide-in Customer Drawer ───────────────────────────────── */}
      <AdminCustomerDrawer
        customer={viewingCustomer}
        isOpen={Boolean(viewingCustomer)}
        onClose={() => setViewingCustomer(null)}
        onToggleStatus={promptToggleStatus}
        isToggling={isToggling && statusTarget?.id === viewingCustomer?.id}
      />

      {/* ── Status Confirmation Dialog ─────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => {
          if (!isToggling) setStatusTarget(null)
        }}
        onConfirm={handleConfirmToggleStatus}
        title={statusTarget?.isActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}
        message={
          statusTarget?.isActive
            ? `Are you sure you want to deactivate ${statusTarget.fullName}'s account? They will be unable to log in, place orders, or book reservations until reactivated.`
            : `Are you sure you want to activate ${statusTarget?.fullName}'s account? They will regain full access to FoodFusion immediately.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate Account' : 'Activate Account'}
        confirmingLabel={statusTarget?.isActive ? 'Deactivating…' : 'Activating…'}
        isConfirming={isToggling}
        error={statusError}
      />
    </div>
  )
}
