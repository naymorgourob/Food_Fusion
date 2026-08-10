import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, UtensilsCrossed, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { AdminDishCard } from '@/features/menu/components/AdminDishCard'
import { AdminDishDetailModal } from '@/features/menu/components/AdminDishDetailModal'
import { MenuItemFormModal } from '@/features/menu/components/MenuItemFormModal'
import { useCategories } from '@/features/menu/hooks/useCategories'
import { useMenuItems } from '@/features/menu/hooks/useMenuItems'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import * as menuItemService from '@/features/menu/services/menuItemService'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price', label: 'Price (low to high)' },
]

const PAGE_SIZE = 12

/**
 * Admin Menu Management (UI-08.1 redesign).
 *
 * Replaces a plain DataTable + native <select> filter row with the card
 * grid, filter panel, and modal vocabulary already established across
 * the redesigned customer/staff pages — same emerald/gold system, same
 * skeleton and empty-state patterns, just applied to the module Admin
 * actually manages the menu from.
 *
 * Every mutation is unchanged: useMenuItems/useCategories, and
 * createMenuItem/updateMenuItem/deleteMenuItem from menuItemService are
 * called exactly as before. No new endpoint, no new field — see the
 * design notes on AdminDishCard, ImageUploadField, MenuItemFormModal,
 * and AdminDishDetailModal for the two things the spec asked for that
 * don't exist on Food (a Featured flag, and true image removal) and how
 * each is honestly scoped instead of faked.
 */
export default function MenuItemsPage() {
  const { categories } = useCategories()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm)
  const [categoryId, setCategoryId] = useState('')
  const [isAvailable, setIsAvailable] = useState('')
  const [categoryStatus, setCategoryStatus] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { items, pagination, isLoading, error, refetch } = useMenuItems({
    search: debouncedSearch,
    categoryId,
    isAvailable,
    categoryStatus,
    sortBy,
    page,
    pageSize: PAGE_SIZE,
  })

  // Any filter change starts back at page 1 — staying on, say, page 3 of a
  // now much-smaller filtered result would just show an empty page.
  function withPageReset(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Bumped on every open (create or edit) so MenuItemFormModal always
  // remounts fresh — keying only on editingItem?.id would leave two
  // *successive* "Add Menu Item" opens sharing the same 'create' key, so
  // the second one would start from whatever was left in the form (and
  // whatever photo was selected) by the first, instead of blank.
  const [modalKey, setModalKey] = useState(0)

  const [viewingItem, setViewingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreateModal() {
    setEditingItem(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(item) {
    setViewingItem(null)
    setEditingItem(item)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openDeleteConfirm(item) {
    setViewingItem(null)
    setDeleteError('')
    setDeleteTarget(item)
  }

  async function handleFormSubmit(payload, imageFile) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingItem) {
        await menuItemService.updateMenuItem(editingItem.id, payload, imageFile)
      } else {
        await menuItemService.createMenuItem(payload, imageFile)
      }
      setFormModalOpen(false)
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
      await menuItemService.deleteMenuItem(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      setDeleteError(error.response?.data?.message ?? 'Failed to delete menu item.')
    } finally {
      setIsDeleting(false)
    }
  }

  const activeFilterCount =
    (categoryId ? 1 : 0) + (isAvailable ? 1 : 0) + (categoryStatus ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  function resetFilters() {
    setSearchTerm('')
    setCategoryId('')
    setIsAvailable('')
    setCategoryStatus('')
    setSortBy('newest')
    setPage(1)
    setFiltersOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Header ------------------------------------------------------ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Menu management</h1>
          <p className="text-sm text-body-muted">
            {isLoading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'dish' : 'dishes'} on the menu`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex flex-none items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Add menu item
        </button>
      </div>

      {/* --- Search + filters --------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => withPageReset(setSearchTerm)(event.target.value)}
            placeholder="Search menu items…"
            aria-label="Search menu items"
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
                value={categoryId}
                onChange={(event) => withPageReset(setCategoryId)(event.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={isAvailable}
                onChange={(event) => withPageReset(setIsAvailable)(event.target.value)}
                aria-label="Filter by availability"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                <option value="">Any availability</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>

              <select
                value={categoryStatus}
                onChange={(event) => withPageReset(setCategoryStatus)(event.target.value)}
                aria-label="Filter by category status"
                className="rounded-xl border border-rule bg-canvas px-3.5 py-2 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
              >
                <option value="">Any category status</option>
                <option value="active">Active category</option>
                <option value="inactive">Inactive category</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort menu items"
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

      {/* --- Grid ----------------------------------------------------------- */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-rule bg-card">
              <div className="skeleton aspect-[4/3]" aria-hidden />
              <div className="flex flex-col gap-2.5 p-4">
                <div className="skeleton h-4 w-2/3 rounded" aria-hidden />
                <div className="skeleton h-3 w-1/2 rounded" aria-hidden />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading menu items…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 px-6 py-16 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
            <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
            {isFiltered ? (
              <SearchX className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            ) : (
              <UtensilsCrossed className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            )}
          </span>
          <p className="font-display text-base font-semibold text-body">
            {isFiltered ? 'No dishes match your filters' : 'No menu items yet'}
          </p>
          <p className="max-w-xs text-sm text-body-muted">
            {isFiltered
              ? 'Try a different search term, or clear your filters to see the full menu.'
              : 'Add your first dish to start building the menu customers will order from.'}
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
              Add menu item
            </button>
          )}
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((dish) => (
                <AdminDishCard
                  key={dish.id}
                  dish={dish}
                  onView={setViewingItem}
                  onEdit={openEditModal}
                  onDelete={openDeleteConfirm}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {pagination.totalPages > 1 && (
            <nav aria-label="Menu pages" className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-card text-body-muted transition-colors hover:border-brand-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm text-body-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-card text-body-muted transition-colors hover:border-brand-200 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}

      <AdminDishDetailModal
        dish={viewingItem}
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
      />

      <MenuItemFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleFormSubmit}
        item={editingItem}
        categories={categories}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
