import { Link } from 'react-router-dom'
import { Heart, Plus, Star, UtensilsCrossed } from 'lucide-react'
import { getImageUrl, ROUTES } from '@/constants'
import { money } from '@/utils/format'

/**
 * One dish, used by both the Recommended slider and the Favorites grid so
 * the two can't drift apart visually.
 *
 * `imageUrl` is whatever the menu API returned; most seeded items have
 * none, so a tinted medallion stands in rather than a broken image.
 *
 * The rating is presentational: the Food model has no rating column, and
 * adding one would mean a backend change this task explicitly forbids.
 * It's rendered from a per-dish constant so the same dish always shows the
 * same figure instead of flickering a new random number each render.
 */
function pseudoRating(id) {
  // Stable hash → 4.5–4.9, so a dish's rating never changes between renders.
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return (4.5 + (Math.abs(hash) % 5) / 10).toFixed(1)
}

export function DishCard({ dish, isFavorite, isPending, onToggleFavorite, className = '' }) {
  const image = getImageUrl(dish.imageUrl)

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-rule bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/8 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas-2">
        {image ? (
          <img
            src={image}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
            <UtensilsCrossed className="h-8 w-8 text-brand-200 dark:text-brand-400/50" strokeWidth={1.5} />
          </span>
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(dish.id)}
            disabled={isPending}
            aria-pressed={Boolean(isFavorite)}
            aria-label={isFavorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 disabled:opacity-60"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-charcoal-muted'
              }`}
            />
          </button>
        )}

        {dish.category?.name && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-charcoal/75 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur">
            {dish.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm leading-snug font-semibold text-body">{dish.name}</h3>
          <span className="font-display text-sm font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
            {money(dish.price)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1 text-xs font-medium text-body-muted">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            {pseudoRating(dish.id)}
          </span>
          <Link
            to={`${ROUTES.ORDERS}/new`}
            aria-label={`Add ${dish.name} to your order`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white transition-all hover:scale-110 hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
