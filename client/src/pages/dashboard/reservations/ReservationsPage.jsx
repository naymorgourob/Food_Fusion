import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, CalendarClock, SearchX } from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { AdminReservationRow } from '@/features/reservations/components/AdminReservationRow'
import { AdminReservationDrawer } from '@/features/reservations/components/AdminReservationDrawer'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import * as reservationService from '@/features/reservations/services/reservationService'
import {
  RESERVATION_STATUS_FILTERS,
  DATE_FILTERS,
  GUEST_FILTERS,
  SORT_OPTIONS,
  filterReservations,
  sortReservations,
} from '@/features/reservations/adminReservationHelpers'

/**
 * Admin Reservation Management (UI-08.5 redesign).
 *
 * Replaces a plain DataTable (no search, no filters, no phone number
 * column) with the search/filter/row vocabulary established across the
 * redesigned Menu, Category, and Order Management modules
 * (UI-08.1/08.2/08.4) — same emerald/gold system, same skeleton and
 * empty-state patterns.
 *
 * Data and the one real mutation are unchanged: useReservations, and
 * updateReservationStatus/cancelReservation from reservationService are
 * called exactly as before.
 *
 * No Create or Edit Reservation form exists here, and this is
 * deliberate: POST /reservations is authorizeCustomer-only (only
 * customers can book — see reservations.routes.js), and Admin's one
 * write path, updateReservationStatus, cannot touch the customer, table,
 * date, or time — reservation.service.js's own docstring says so. A
 * Table Filter is likewise not offered: GET /tables returns tables, but
 * there is no reservation-count-per-table view that would make a table
 * picker meaningful here without misrepresenting it as an availability
 * check the backend doesn't perform.
 */
export default function ReservationsPage() {
  const { reservations, isLoading, error, refetch } = useReservations()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [guestFilter, setGuestFilter] = useState('')
  const [sortBy, setSortBy] = useState('upcoming')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [viewingReservation, setViewingReservation] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const filtered = useMemo(
    () =>
      filterReservations(reservations, {
        search: searchTerm,
        status: statusFilter,
        date: dateFilter,
        guests: guestFilter,
      }),
    [reservations, searchTerm, statusFilter, dateFilter, guestFilter],
  )

  const sorted = useMemo(() => sortReservations(filtered, sortBy), [filtered, sortBy])

  async function handleStatusChange(status) {
    setIsUpdatingStatus(true)
    try {
      const updated = await reservationService.updateReservationStatus(viewingReservation.id, status)
      setViewingReservation(updated)
      refetch()
    } catch {
      refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      await reservationService.cancelReservation(cancelTarget.id)
      setCancelTarget(null)
      refetch()
    } catch (error) {
      setCancelError(error.response?.data?.message ?? 'Failed to cancel reservation.')
    } finally {
      setIsCancelling(false)
    }
  }

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (dateFilter ? 1 : 0) + (guestFilter ? 1 : 0) + (sortBy !== 'upcoming' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setDateFilter('')
    setGuestFilter('')
    setSortBy('upcoming')
    setFiltersOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Header ------------------------------------------------------ */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Reservations</h1>
        <p className="text-sm text-body-muted">
          {isLoading
            ? 'Loading…'
            : `${sorted.length} of ${reservations.length} ${reservations.length === 1 ? 'reservation' : 'reservations'}`}
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
            placeholder="Search name or phone…"
            aria-label="Search reservations"
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
                aria-label="Filter by reservation status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {RESERVATION_STATUS_FILTERS.map((option) => (
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
                value={guestFilter}
                onChange={(event) => setGuestFilter(event.target.value)}
                aria-label="Filter by party size"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {GUEST_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort reservations"
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
          <span className="sr-only">Loading reservations…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 px-6 py-16 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
            <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
            {isFiltered ? (
              <SearchX className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            ) : (
              <CalendarClock className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            )}
          </span>
          <p className="font-display text-base font-semibold text-body">
            {isFiltered ? 'No reservations match your filters' : 'No reservations yet'}
          </p>
          <p className="max-w-xs text-sm text-body-muted">
            {isFiltered
              ? 'Try a different search term, or clear your filters to see every booking.'
              : 'Reservations will appear here as customers book a table.'}
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
            {sorted.map((reservation) => (
              <AdminReservationRow
                key={reservation.id}
                reservation={reservation}
                onView={setViewingReservation}
                onCancel={(row) => {
                  setCancelError('')
                  setCancelTarget(row)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AdminReservationDrawer
        key={viewingReservation?.id ?? 'none'}
        reservation={viewingReservation}
        isOpen={Boolean(viewingReservation)}
        onClose={() => setViewingReservation(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Reservation"
        message={`Cancel the reservation for ${cancelTarget?.customerName}? This cannot be undone.`}
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep Reservation"
        confirmLabel="Cancel Reservation"
        confirmingLabel="Cancelling…"
      />
    </div>
  )
}
