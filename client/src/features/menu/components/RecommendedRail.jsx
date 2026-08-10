import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MenuDishCard } from '@/features/menu/components/MenuDishCard'

/**
 * Horizontal slider of suggested dishes (UI-03).
 *
 * The heading is supplied by the caller so the same rail can serve
 * "Customers also liked" and "Goes well together". What it can honestly
 * claim is limited by the data: there is no order-pair analysis or review
 * table behind this, so the caller passes dishes from the same category as
 * the current selection and labels the rail accordingly — a real
 * relationship ("from the same part of the menu"), not an invented one
 * ("87% of customers also bought").
 *
 * Scroll buttons are hidden from assistive tech: the list itself is
 * keyboard-scrollable and every card is already in the tab order, so the
 * arrows would only add duplicate stops.
 */
export function RecommendedRail({ title, subtitle, dishes, cart, favorites, onQuickView, onAdd }) {
  const railRef = useRef(null)

  if (!dishes?.length) return null

  function scrollBy(direction) {
    railRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="recommended-heading" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="recommended-heading" className="font-display text-xl font-semibold text-body">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-body-muted">{subtitle}</p>}
        </div>

        <div aria-hidden className="hidden flex-none gap-2 sm:flex">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-card text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-card text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul ref={railRef} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {dishes.map((dish) => (
          <li key={dish.id} className="w-56 flex-none snap-start sm:w-64">
            <MenuDishCard
              dish={dish}
              quantity={cart.quantityOf(dish.id)}
              isFavorite={favorites.isFavorite(dish.id)}
              isPending={favorites.pendingId === dish.id}
              onToggleFavorite={favorites.toggleFavorite}
              onQuickView={onQuickView}
              onAdd={onAdd}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
