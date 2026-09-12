import { Heart, Plus, UtensilsCrossed, Star } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'

function pseudoRating(id) {
  let hash = 0
  for (let i = 0; i < (id?.length || 0); i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return (4.5 + (Math.abs(hash) % 5) / 10).toFixed(1)
}

export function CustomerFavoriteCard({
  dish,
  isFavorite = true,
  isPending = false,
  onToggleFavorite,
  onSelect,
  onOrder,
}) {
  const image = getImageUrl(dish.imageUrl)
  const isAvailable = dish.isAvailable !== false

  return (
    <article
      onClick={() => onSelect?.(dish)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-rule bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl hover:shadow-brand-950/10 cursor-pointer"
    >
      {/* Image Media Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas-2">
        {image ? (
          <img
            src={image}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-900/30 via-canvas-2 to-canvas-2">
            <UtensilsCrossed className="h-10 w-10 text-brand-400/40" strokeWidth={1.5} />
          </div>
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-black/30 pointer-events-none" />

        {/* Category & Status Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {dish.category?.name && (
            <span className="rounded-full bg-charcoal/70 px-2.5 py-0.5 text-[0.6875rem] font-medium text-white/90 backdrop-blur-md border border-white/10">
              {dish.category.name}
            </span>
          )}
          {!isAvailable && (
            <span className="rounded-full bg-red-950/85 px-2.5 py-0.5 text-[0.6875rem] font-medium text-red-200 backdrop-blur-md border border-red-500/30">
              Unavailable
            </span>
          )}
        </div>

        {/* Favorite Heart Action (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(dish.id)
          }}
          disabled={isPending}
          aria-label={isFavorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/65 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 hover:bg-charcoal/90 disabled:opacity-60 shadow-sm active:scale-95"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80'
            }`}
          />
        </button>

        {/* Star Rating Badge (Bottom Left of image) */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-md bg-charcoal/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10 pointer-events-none">
          <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
          <span>{pseudoRating(dish.id)}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold leading-snug text-body transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-1">
            {dish.name}
          </h3>
          {dish.description && (
            <p className="text-xs text-body-muted line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          )}
        </div>

        {/* Price & Primary Action */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-rule/50">
          <div className="flex flex-col">
            <span className="text-[0.65rem] uppercase tracking-wider text-body-muted">Price</span>
            <span className="font-display text-base font-bold text-brand-700 dark:text-brand-400">
              {money(dish.price)}
            </span>
          </div>

          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOrder?.(dish)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:scale-95"
              aria-label={`Order ${dish.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Order</span>
            </button>
          ) : (
            <span className="rounded-lg bg-canvas-2 px-2.5 py-1 text-[0.7rem] font-medium text-body-muted border border-rule">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

