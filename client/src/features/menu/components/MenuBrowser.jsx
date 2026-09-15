import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchX, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCategories } from '@/features/menu/hooks/useCategories'
import { useMenuItems } from '@/features/menu/hooks/useMenuItems'
import { MenuHero } from '@/features/menu/components/MenuHero'
import { CategoryChips } from '@/features/menu/components/CategoryChips'
import { MenuFilterPanel } from '@/features/menu/components/MenuFilterPanel'
import { MenuDishCard } from '@/features/menu/components/MenuDishCard'
import { TodaysSpecial } from '@/features/menu/components/TodaysSpecial'
import { pickSpecial } from '@/features/menu/utils/special'
import { RecommendedRail } from '@/features/menu/components/RecommendedRail'
import { EmptyState } from '@/components/customer/ui'

const PAGE_SIZE = 12
const PRICE_CEILING = 2000
const SEARCH_DEBOUNCE_MS = 300

const DEFAULT_FILTERS = {
  availability: 'true', // customers browse what they can actually order
  sortBy: 'newest',
  priceMax: PRICE_CEILING,
}

function DishGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-rule bg-card">
          <div className="skeleton aspect-[4/3]" aria-hidden />
          <div className="flex flex-col gap-2.5 p-4">
            <div className="skeleton h-4 w-2/3 rounded" aria-hidden />
            <div className="skeleton h-3 w-full rounded" aria-hidden />
            <div className="skeleton h-3 w-1/2 rounded" aria-hidden />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading dishes…</span>
    </>
  )
}

/**
 * The menu browsing experience (UI-03): hero + search, category chips,
 * filters, today's special, the dish grid, and a recommendation rail.
 *
 * All data comes from the existing menu APIs — useCategories and
 * useMenuItems, unchanged. Search, category, availability, sort, and
 * pagination are pushed to the server (which supports them); the price
 * ceiling is applied client-side to the current page because the API has
 * no min/max price param and adding one would mean a backend change.
 *
 * This component owns browsing only. The cart lives in the parent so the
 * same cart survives moving between browsing and checkout.
 */
export function MenuBrowser({ cart, favorites, onQuickView, onAdd, initialSearch = '' }) {
  // Lazy initializers, not an effect: the handed-over ?q= term is the
  // starting value of this state, not something to synchronise with.
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [search, setSearch] = useState(initialSearch)
  const [categoryId, setCategoryId] = useState('all')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Debounce so typing doesn't fire a request per keystroke. Page resets
  // here too: a customer on page 3 who types a new term must not land on
  // an empty page 3 of the new result set.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { categories, isLoading: categoriesLoading } = useCategories()

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      categoryId: categoryId === 'all' ? undefined : categoryId,
      isAvailable: filters.availability || undefined,
      sortBy: filters.sortBy,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, categoryId, filters.availability, filters.sortBy, page],
  )

  const { items, pagination, isLoading, error } = useMenuItems(queryParams)

  // Keeps cart lines seeded from ids (Order Again / favorites) in sync with
  // the dish records as pages load.
  useEffect(() => {
    cart.hydrate(items)
  }, [items, cart])

  const visibleItems = useMemo(
    () => items.filter((item) => Number(item.price) <= filters.priceMax),
    [items, filters.priceMax],
  )

  const special = useMemo(() => pickSpecial(items), [items])

  // "You might also like": other available dishes from the same category as
  // the special, which is a real relationship rather than a fabricated one.
  const recommended = useMemo(() => {
    if (!special) return []
    return items
      .filter((item) => item.isAvailable && item.id !== special.id && item.categoryId === special.categoryId)
      .slice(0, 8)
  }, [items, special])

  const activeFilterCount =
    (filters.availability !== DEFAULT_FILTERS.availability ? 1 : 0) +
    (filters.sortBy !== DEFAULT_FILTERS.sortBy ? 1 : 0) +
    (filters.priceMax !== DEFAULT_FILTERS.priceMax ? 1 : 0)

  const isFiltered = Boolean(search) || categoryId !== 'all' || activeFilterCount > 0

  // Every one of these changes *what* is being asked for, so each returns
  // to page 1 alongside the change rather than in a reactive effect.
  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function selectCategory(nextId) {
    setCategoryId(nextId)
    setPage(1)
  }

  function resetEverything() {
    setFilters(DEFAULT_FILTERS)
    setCategoryId('all')
    setSearchInput('')
    setFiltersOpen(false)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-8">
      <MenuHero
        search={searchInput}
        onSearchChange={setSearchInput}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <CategoryChips
        categories={categories}
        activeId={categoryId}
        onSelect={selectCategory}
        isLoading={categoriesLoading}
      />

      {/* The special is editorial framing on top of a real dish, so it only
          shows on an unfiltered browse — surfacing it inside a filtered
          result set would misrepresent it as a match. */}
      {!isFiltered && special && (
        <TodaysSpecial dish={special} onView={onQuickView} onAdd={onAdd} />
      )}

      <div className="flex gap-8">
        <MenuFilterPanel
          filters={filters}
          onChange={updateFilters}
          onReset={resetEverything}
          maxPrice={PRICE_CEILING}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Result count doubles as the live region for filter changes. */}
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-sm text-body-muted">
              {isLoading
                ? 'Loading dishes…'
                : `${visibleItems.length} ${visibleItems.length === 1 ? 'dish' : 'dishes'}${
                    pagination.total > items.length ? ` of ${pagination.total}` : ''
                  }`}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetEverything}
                className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
              >
                Clear all
              </button>
            )}
          </div>

          {error ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="We couldn't load the menu"
              description={error}
            />
          ) : (
            <>
              <motion.ul layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading ? (
                  <DishGridSkeleton />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {visibleItems.map((dish) => (
                      <motion.li
                        key={dish.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <MenuDishCard
                          dish={dish}
                          quantity={cart.quantityOf(dish.id)}
                          isFavorite={favorites.isFavorite(dish.id)}
                          isPending={favorites.pendingId === dish.id}
                          onToggleFavorite={favorites.toggleFavorite}
                          onQuickView={onQuickView}
                          onAdd={onAdd}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                )}
              </motion.ul>

              {!isLoading && visibleItems.length === 0 && (
                <EmptyState
                  icon={SearchX}
                  title={search ? `No dishes match “${search}”` : 'Nothing on the menu here yet'}
                  description={
                    isFiltered
                      ? 'Try a different category, widen the price range, or clear your filters.'
                      : 'Our kitchen is updating this section. Please check back shortly.'
                  }
                />
              )}

              {/* Pagination — server-driven, so it reflects the true total. */}
              {!isLoading && pagination.totalPages > 1 && (
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
        </div>
      </div>

      {!isFiltered && recommended.length > 0 && (
        <RecommendedRail
          title="You might also like"
          subtitle={`More from ${special?.category?.name ?? 'our kitchen'}`}
          dishes={recommended}
          cart={cart}
          favorites={favorites}
          onQuickView={onQuickView}
          onAdd={onAdd}
        />
      )}
    </div>
  )
}
