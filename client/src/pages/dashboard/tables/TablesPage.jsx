import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, Armchair, SearchX, ListFilter } from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { AdminTableCard } from '@/features/tables/components/AdminTableCard'
import { AdminTableDrawer } from '@/features/tables/components/AdminTableDrawer'
import { TableFormModal } from '@/features/tables/components/TableFormModal'
import { TableStatsSummary } from '@/features/tables/components/TableStatsSummary'
import { useTables } from '@/features/tables/hooks/useTables'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import * as tableService from '@/features/tables/services/tableService'
import {
  STATUS_FILTERS,
  CAPACITY_FILTERS,
  SORT_OPTIONS,
  filterTables,
  sortTables,
} from '@/features/tables/tableHelpers'

/**
 * Admin Table Management (UI-08.6 redesign).
 *
 * Replaces the plain DataTable with:
 *  - A quick-stats bar (Available / Occupied / Reserved / Inactive counts)
 *    that doubles as a click-to-filter shortcut.
 *  - A card grid — one card per table — that reads like a simplified
 *    floor plan (status-colour border, seat-dot grid, linked reservation
 *    indicator).
 *  - A slide-in drawer for full table detail + linked reservations, matching
 *    AdminReservationDrawer (UI-08.5) and AdminOrderDrawer (UI-08.4).
 *  - A redesigned form modal matching CategoryFormModal (UI-08.2).
 *  - Search, status filter (clickable stat pills + dropdown), capacity filter,
 *    sort — all client-side over the single fetched result set.
 *
 * Data is unchanged: useTables() and all tableService calls are identical.
 * Reservation data comes from useReservations(), which is already fetched
 * by the shared Admin layout — no extra network cost — and is used only
 * to show which tables have upcoming bookings without any write operations
 * from this page.
 */
export default function TablesPage() {
  const { tables, isLoading, error, refetch } = useTables()
  // Reservations are used read-only: to show linked bookings on each table
  // card/drawer. No reservation mutations happen from this page.
  const { reservations } = useReservations()

  // --- Filter / sort state ---
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const [sortBy, setSortBy] = useState('number')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // --- Modals / drawer state ---
  const [viewingTable, setViewingTable] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // --- Derived data ---
  const filtered = useMemo(
    () => filterTables(tables, { search: searchTerm, status: statusFilter, capacity: capacityFilter }),
    [tables, searchTerm, statusFilter, capacityFilter],
  )
  const sorted = useMemo(() => sortTables(filtered, sortBy), [filtered, sortBy])

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (capacityFilter ? 1 : 0) + (sortBy !== 'number' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  // Group today's reservations by tableId for O(1) lookup on card render
  const todayReservationByTableId = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const map = {}
    for (const res of reservations ?? []) {
      if (res.status === 'CANCELLED' || res.status === 'COMPLETED') continue
      const d = new Date(res.reservationDate)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() !== today.getTime()) continue
      // Keep earliest time for that table if multiple
      if (!map[res.tableId]) map[res.tableId] = res
    }
    return map
  }, [reservations])

  // All reservations for the drawer (any status, any date, for viewed table)
  const linkedReservationsForViewing = useMemo(() => {
    if (!viewingTable) return []
    return (reservations ?? []).filter((r) => r.tableId === viewingTable.id)
  }, [reservations, viewingTable])

  // --- Handlers ---
  function openCreateModal() {
    setEditingTable(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(table) {
    setViewingTable(null)
    setEditingTable(table)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function closeFormModal() {
    setFormModalOpen(false)
    setEditingTable(null)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable.id, payload)
      } else {
        await tableService.createTable(payload)
      }
      closeFormModal()
      refetch()
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setFormErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await tableService.deleteTable(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      setDeleteError(error.response?.data?.message ?? 'Failed to delete table.')
    } finally {
      setIsDeleting(false)
    }
  }

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setCapacityFilter('')
    setSortBy('number')
    setFiltersOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Tables</h1>
          <p className="text-sm text-body-muted">
            {isLoading
              ? 'Loading…'
              : `${sorted.length} of ${tables.length} ${tables.length === 1 ? 'table' : 'tables'}`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex flex-none items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Add table
        </button>
      </div>

      {/* ── Status stats (clickable filters) ────────────────────────── */}
      {!isLoading && tables.length > 0 && (
        <TableStatsSummary
          tables={tables}
          activeFilter={statusFilter}
          onFilterByStatus={setStatusFilter}
        />
      )}

      {/* ── Search + filter bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by table number or description…"
            aria-label="Search tables"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        {/* Sort inline for quick access */}
        <div className="relative flex-none">
          <ListFilter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort tables"
            className="rounded-full border border-rule bg-card py-2.5 pr-4 pl-9 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

      {/* ── Expanded filter row ──────────────────────────────────────── */}
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
                aria-label="Filter by status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={capacityFilter}
                onChange={(event) => setCapacityFilter(event.target.value)}
                aria-label="Filter by capacity"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {CAPACITY_FILTERS.map((option) => (
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

      {/* ── Grid / Loading / Empty ──────────────────────────────────── */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : isLoading ? (
        // Skeleton loading — card-shaped
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col rounded-2xl border border-rule bg-card">
              <div className="skeleton h-16 w-full rounded-t-2xl" aria-hidden />
              <div className="flex flex-col gap-3 p-5">
                <div className="skeleton h-3 w-1/2 rounded" aria-hidden />
                <div className="skeleton h-3 w-3/4 rounded" aria-hidden />
                <div className="skeleton h-3 w-1/3 rounded" aria-hidden />
              </div>
              <div className="skeleton h-10 w-full rounded-b-2xl" aria-hidden />
            </div>
          ))}
          <span className="sr-only">Loading tables…</span>
        </div>
      ) : sorted.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 px-6 py-16 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
            <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
            {isFiltered ? (
              <SearchX className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            ) : (
              <Armchair className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            )}
          </span>
          <p className="font-display text-base font-semibold text-body">
            {isFiltered ? 'No tables match your filters' : 'No tables yet'}
          </p>
          <p className="max-w-xs text-sm text-body-muted">
            {isFiltered
              ? 'Try a different search term or clear the filters to see all tables.'
              : 'Add your first table to start managing your restaurant floor.'}
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add table
            </button>
          )}
        </div>
      ) : (
        // Card grid
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((table) => (
              <AdminTableCard
                key={table.id}
                table={table}
                todayReservation={todayReservationByTableId[table.id] ?? null}
                onView={setViewingTable}
                onEdit={openEditModal}
                onDelete={(t) => {
                  setDeleteError('')
                  setDeleteTarget(t)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Table detail drawer ──────────────────────────────────────── */}
      <AdminTableDrawer
        key={viewingTable?.id ?? 'none'}
        table={viewingTable}
        linkedReservations={linkedReservationsForViewing}
        isOpen={Boolean(viewingTable)}
        onClose={() => setViewingTable(null)}
        onEdit={openEditModal}
        onDelete={(t) => {
          setDeleteError('')
          setDeleteTarget(t)
        }}
      />

      {/* ── Add / Edit form modal ──────────────────────────────────── */}
      <TableFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        table={editingTable}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      {/* ── Delete confirmation ────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Table"
        message={`Are you sure you want to delete Table ${deleteTarget?.number}? This cannot be undone.`}
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
