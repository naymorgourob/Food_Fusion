import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  SlidersHorizontal,
  ListFilter,
  Package,
  SearchX,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { InventoryStatsSummary } from '@/features/inventory/components/InventoryStatsSummary'
import { LowStockBanner } from '@/features/inventory/components/LowStockBanner'
import { AdminInventoryRow } from '@/features/inventory/components/AdminInventoryRow'
import { InventoryFormModal } from '@/features/inventory/components/InventoryFormModal'
import { useInventory } from '@/features/inventory/hooks/useInventory'
import * as inventoryService from '@/features/inventory/services/inventoryService'
import {
  STATUS_FILTERS,
  SORT_OPTIONS,
  filterInventory,
  sortInventory,
} from '@/features/inventory/inventoryHelpers'

/**
 * Admin Inventory Management (UI-08.3 redesign).
 *
 * Full integration with existing `/inventory` backend APIs:
 * - Real PostgreSQL inventory data loaded via `useInventory`
 * - Live stock calculations: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
 * - Interactive metrics summary bar with clickable filter shortcuts
 * - Smart Low Stock Alert Banner highlighting immediate restocking needs
 * - Instant search by item name or category
 * - Dynamic category & status filtering with multi-criteria sorting
 * - Redesigned Add / Edit modal with real-time status projection
 * - Safe item deletion with confirmation dialog
 */
export default function InventoryPage() {
  const { items, isLoading, error, refetch } = useInventory()

  // --- Filter & sort state ---
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('urgent')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // --- Modals state ---
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  // --- Delete confirmation state ---
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // --- Feedback notifications ---
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Extract unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set()
    for (const item of items) {
      if (item.category) set.add(item.category.trim())
    }
    return Array.from(set).sort()
  }, [items])

  // Filtered & sorted inventory items
  const filtered = useMemo(
    () =>
      filterInventory(items, {
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
      }),
    [items, searchTerm, statusFilter, categoryFilter]
  )
  const sorted = useMemo(() => sortInventory(filtered, sortBy), [filtered, sortBy])

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (sortBy !== 'urgent' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  function handleStatCardFilter(status) {
    setStatusFilter(status)
  }

  function handleFilterUrgent() {
    setStatusFilter('LOW_STOCK')
    setSortBy('urgent')
  }

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setCategoryFilter('')
    setSortBy('urgent')
  }

  function openCreateModal() {
    setEditingItem(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function closeFormModal() {
    setFormModalOpen(false)
    setEditingItem(null)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingItem) {
        await inventoryService.updateInventoryItem(editingItem.id, payload)
        setFeedbackMessage({
          type: 'success',
          text: `"${payload.itemName}" was updated successfully.`,
        })
      } else {
        await inventoryService.createInventoryItem(payload)
        setFeedbackMessage({
          type: 'success',
          text: `"${payload.itemName}" was added to inventory.`,
        })
      }
      setTimeout(() => setFeedbackMessage(null), 4000)
      closeFormModal()
      refetch()
    } catch (err) {
      const details = err.response?.data?.details
      const message = err.response?.data?.message ?? 'Something went wrong. Please try again.'
      setFormErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      await inventoryService.deleteInventoryItem(deleteTarget.id)
      setFeedbackMessage({
        type: 'success',
        text: `"${deleteTarget.itemName}" was removed from inventory.`,
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete inventory item.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-body">Inventory Management</h1>
            <span className="flex h-6 items-center justify-center rounded-full bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {items.length} items tracked
            </span>
          </div>
          <p className="text-sm text-body-muted">
            Track kitchen ingredients, monitor restock thresholds, and prevent supply shortages.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Add Inventory Item
        </button>
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

      {/* ── Low Stock Alert Banner ─────────────────────────────────── */}
      {!isLoading && items.length > 0 && (
        <LowStockBanner items={items} onFilterUrgent={handleFilterUrgent} />
      )}

      {/* ── Metrics Summary Bar ────────────────────────────────────── */}
      <InventoryStatsSummary
        items={items}
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
            placeholder="Search by ingredient or category…"
            aria-label="Search inventory"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        {/* Sort selector */}
        <div className="relative flex-none">
          <ListFilter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort inventory"
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
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by inventory status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-rule bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="skeleton h-11 w-11 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-4 w-36 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
              </div>
              <div className="skeleton h-8 w-28 rounded-lg" />
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
              <h3 className="font-display text-base font-bold text-body">No inventory items found</h3>
              <p className="max-w-sm text-xs text-body-muted">
                No items match your active search or filter criteria. Try adjusting your query or clearing filters.
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
              <Package className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-body">No inventory items yet</h3>
              <p className="max-w-sm text-xs text-body-muted">
                Keep track of kitchen produce, meats, spices, and packaging supplies.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold text-charcoal hover:bg-gold-400"
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-body-muted px-1">
            <span>
              Showing <strong className="text-body font-semibold">{sorted.length}</strong> of{' '}
              <strong className="text-body font-semibold">{items.length}</strong> inventory items
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
            {sorted.map((item) => (
              <AdminInventoryRow
                key={item.id}
                item={item}
                onEdit={openEditModal}
                onDelete={(target) => {
                  setDeleteError('')
                  setDeleteTarget(target)
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Inventory Modal ──────────────────────────────── */}
      <InventoryFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        item={editingItem}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.itemName}"? This item will be permanently removed from inventory.`}
        isConfirming={isDeleting}
        error={deleteError}
        confirmLabel="Delete Item"
        confirmingLabel="Deleting…"
      />
    </div>
  )
}
