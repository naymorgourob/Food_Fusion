import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'

/**
 * Menu filters (UI-03). One component renders both the desktop sidebar and
 * the mobile drawer so the two can never drift apart.
 *
 * Which filters exist here is dictated by the schema. Food has price,
 * isAvailable, categoryId, createdAt and prepTimeMinutes — so price range,
 * availability and sort are offered. Rating / vegetarian / spicy / best
 * seller were requested but have no backing column, and a filter that
 * silently does nothing is worse than an absent one.
 *
 * Price is filtered client-side against the loaded page because the menu
 * API takes no min/max param; that's stated in the UI so the number can't
 * mislead.
 */

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price', label: 'Price (low to high)' },
  { value: 'oldest', label: 'Oldest first' },
]

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Everything' },
  { value: 'true', label: 'Available now' },
  { value: 'false', label: 'Currently unavailable' },
]

function FilterBody({ filters, onChange, onReset, maxPrice }) {
  const { availability, sortBy, priceMax } = filters

  return (
    <div className="flex flex-col gap-7">
      {/* --- Sort ------------------------------------------------------- */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-1 font-display text-sm font-semibold text-body">Sort by</legend>
        {SORT_OPTIONS.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-body-muted">
            <input
              type="radio"
              name="menu-sort"
              value={value}
              checked={sortBy === value}
              onChange={() => onChange({ sortBy: value })}
              className="h-4 w-4 accent-brand-700"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {/* --- Availability ------------------------------------------------ */}
      <fieldset className="flex flex-col gap-2.5 border-t border-rule pt-6">
        <legend className="mb-1 font-display text-sm font-semibold text-body">Availability</legend>
        {AVAILABILITY_OPTIONS.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-body-muted">
            <input
              type="radio"
              name="menu-availability"
              value={value}
              checked={availability === value}
              onChange={() => onChange({ availability: value })}
              className="h-4 w-4 accent-brand-700"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {/* --- Price ------------------------------------------------------- */}
      <div className="flex flex-col gap-3 border-t border-rule pt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="menu-price" className="font-display text-sm font-semibold text-body">
            Max price
          </label>
          <span className="font-display text-sm font-semibold text-brand-700 dark:text-brand-400">
            ৳{Number(priceMax).toFixed(0)}
          </span>
        </div>
        <input
          id="menu-price"
          type="range"
          min="0"
          max={maxPrice}
          step="1"
          value={priceMax}
          onChange={(event) => onChange({ priceMax: Number(event.target.value) })}
          className="w-full accent-brand-700"
        />
        <div className="flex justify-between text-xs text-body-faint">
          <span>৳0</span>
          <span>৳{maxPrice}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-rule px-4 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset filters
      </button>
    </div>
  )
}

export function MenuFilterPanel({ filters, onChange, onReset, maxPrice, isOpen, onClose }) {
  // Escape closes the mobile drawer, matching the dialog role it advertises.
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      {/* Desktop: a sticky rail beside the grid. */}
      <aside
        aria-label="Menu filters"
        className="sticky top-24 hidden h-fit w-60 flex-none rounded-2xl border border-rule bg-card p-5 lg:block"
      >
        <FilterBody filters={filters} onChange={onChange} onReset={onReset} maxPrice={maxPrice} />
      </aside>

      {/* Mobile: a slide-in drawer. */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu filters"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-canvas shadow-2xl"
            >
              <div className="flex flex-none items-center justify-between border-b border-rule px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-body">Filters</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterBody filters={filters} onChange={onChange} onReset={onReset} maxPrice={maxPrice} />
              </div>
              <div className="flex-none border-t border-rule p-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full bg-brand-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Show results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
