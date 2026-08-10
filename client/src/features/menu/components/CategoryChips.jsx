import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

/**
 * Horizontal category filter pills (UI-03).
 *
 * Categories come from the real /menu/categories API rather than a
 * hardcoded list, so a restaurant that renames "Pizza" to "Wood-Fired"
 * sees that immediately without a code change.
 *
 * The active pill is marked by fill *and* by aria-pressed, so the state
 * isn't communicated by colour alone.
 */
export function CategoryChips({ categories, activeId, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex gap-2.5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-10 w-28 flex-none rounded-full" aria-hidden />
        ))}
        <span className="sr-only">Loading categories…</span>
      </div>
    )
  }

  const chips = [{ id: 'all', name: 'All dishes', icon: Sparkles }, ...categories]

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1"
    >
      {chips.map(({ id, name, icon: Icon }) => {
        const active = activeId === id
        // The sliding pill animates in, so the active chip also carries a
        // static emerald background — without it the first paint is white
        // text on a white chip until the layout animation lands.
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active}
            className={`relative flex-none rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              active
                ? 'bg-brand-700 text-white'
                : 'border border-rule bg-card text-body-muted hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400'
            }`}
          >
            {active && (
              <motion.span
                layoutId="category-chip-active"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-brand-700"
              />
            )}
            <span className="flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
