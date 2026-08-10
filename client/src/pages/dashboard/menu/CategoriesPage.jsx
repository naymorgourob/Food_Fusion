import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Tag, SearchX, ListFilter } from 'lucide-react'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { AdminCategoryCard } from '@/features/menu/components/AdminCategoryCard'
import { AdminCategoryDetailModal } from '@/features/menu/components/AdminCategoryDetailModal'
import { CategoryFormModal } from '@/features/menu/components/CategoryFormModal'
import { useCategories } from '@/features/menu/hooks/useCategories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import * as categoryService from '@/features/menu/services/categoryService'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'items', label: 'Most dishes' },
]

/**
 * Admin Category Management (UI-08.2 redesign).
 *
 * Replaces a plain DataTable with the card grid, filter row, and modal
 * vocabulary established across the redesigned Menu Management module
 * (UI-08.1) — same emerald/gold system, same skeleton and empty-state
 * patterns, applied to Categories.
 *
 * Data and mutations are unchanged: useCategories, and
 * createCategory/updateCategory/deleteCategory from categoryService are
 * called exactly as before, including the search parameter the API
 * already supported — the debounce is new (matching MenuItemsPage's
 * pattern) so typing doesn't fire a request per keystroke, but the
 * request itself is the same GET /menu/categories?search=... call.
 *
 * Sorting is client-side: the API returns categories already sorted by
 * name and has no sort parameter, so "Newest/Oldest/Most dishes" reorder
 * the page's own result set rather than requesting a different order
 * from the server.
 *
 * deleteCategory's real business rule — a category with any menu items
 * still assigned to it can't be deleted (409, see
 * server/src/services/category.service.js) — is preserved exactly:
 * ConfirmDialog still surfaces whatever message the API returns, so an
 * admin who tries to delete "Desserts" while it has 6 dishes still sees
 * why it was refused, not a silently-swallowed failure.
 */
export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm)
  const [sortBy, setSortBy] = useState('name')
  const { categories, isLoading, error, refetch } = useCategories(debouncedSearch)

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Bumped on every open (create or edit) so CategoryFormModal always
  // remounts fresh — keying only on editingCategory?.id would leave two
  // *successive* "Add Category" opens sharing the same 'create' key, so
  // the second one would start from whatever was left in the form by
  // the first, instead of blank.
  const [modalKey, setModalKey] = useState(0)

  const [viewingCategory, setViewingCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const sorted = useMemo(() => {
    const list = [...categories]
    if (sortBy === 'newest') return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'oldest') return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (sortBy === 'items') return list.sort((a, b) => b.itemCount - a.itemCount)
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, sortBy])

  function openCreateModal() {
    setEditingCategory(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(category) {
    setViewingCategory(null)
    setEditingCategory(category)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openDeleteConfirm(category) {
    setViewingCategory(null)
    setDeleteError('')
    setDeleteTarget(category)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload)
      } else {
        await categoryService.createCategory(payload)
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
      await categoryService.deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      // Preserves the real "N menu items still assigned" 409 message from
      // category.service.js verbatim — this is a genuine business rule,
      // not a generic failure, so the admin needs to see exactly why.
      setDeleteError(error.response?.data?.message ?? 'Failed to delete category.')
    } finally {
      setIsDeleting(false)
    }
  }

  const isFiltered = Boolean(searchTerm)

  return (
    <div className="flex flex-col gap-6">
      {/* --- Header ------------------------------------------------------ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Categories</h1>
          <p className="text-sm text-body-muted">
            {isLoading ? 'Loading…' : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex flex-none items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>

      {/* --- Search + sort ------------------------------------------------ */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search categories…"
            aria-label="Search categories"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        <div className="relative flex-none">
          <ListFilter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort categories"
            className="rounded-full border border-rule bg-card py-2.5 pr-4 pl-9 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Grid ----------------------------------------------------------- */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-2xl" aria-hidden />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="skeleton h-4 w-2/3 rounded" aria-hidden />
                  <div className="skeleton h-3 w-1/3 rounded" aria-hidden />
                </div>
              </div>
              <div className="skeleton h-3 w-full rounded" aria-hidden />
            </div>
          ))}
          <span className="sr-only">Loading categories…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 px-6 py-16 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
            <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
            {isFiltered ? (
              <SearchX className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            ) : (
              <Tag className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
            )}
          </span>
          <p className="font-display text-base font-semibold text-body">
            {isFiltered ? 'No categories match your search' : 'No categories yet'}
          </p>
          <p className="max-w-xs text-sm text-body-muted">
            {isFiltered
              ? 'Try a different search term, or clear the search to see all categories.'
              : 'Add your first category to start organising the menu.'}
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Clear search
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add category
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((category) => (
              <AdminCategoryCard
                key={category.id}
                category={category}
                onView={setViewingCategory}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AdminCategoryDetailModal
        category={viewingCategory}
        isOpen={Boolean(viewingCategory)}
        onClose={() => setViewingCategory(null)}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
      />

      <CategoryFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
