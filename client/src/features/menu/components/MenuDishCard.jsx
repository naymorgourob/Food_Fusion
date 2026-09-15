import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, Clock, Eye, Check, UtensilsCrossed } from 'lucide-react'
import { getMenuImageUrl } from '@/constants'
import { money } from '@/utils/format'

/**
 * A single dish in the menu grid (UI-03).
 *
 * Every field shown here is a real column on the Food model: image, name,
 * description, category, prepTimeMinutes, price, isAvailable. Ratings,
 * review counts, and calories were requested but don't exist in the
 * schema, and inventing them would put fake numbers in front of a
 * customer — so they're omitted rather than faked.
 *
 * "New" is the one badge shown, and it's derived honestly from createdAt.
 *
 * Unavailable dishes stay visible (a premium menu still shows what it
 * serves) but their add button is disabled, matching the backend, which
 * rejects unavailable items at order creation.
 */

const NEW_FOR_DAYS = 14

function isNew(createdAt) {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age >= 0 && age < NEW_FOR_DAYS * 24 * 60 * 60 * 1000
}

export function MenuDishCard({
  dish,
  quantity = 0,
  isFavorite = false,
  isPending = false,
  onToggleFavorite,
  onQuickView,
  onAdd,
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const { primary, fallback } = getMenuImageUrl(dish)
  const image = imageFailed ? fallback : primary || fallback
  const unavailable = !dish.isAvailable
  const inCart = quantity > 0

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-rule bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-900/10 ${
        unavailable ? 'opacity-75' : ''
      }`}
    >
      {/* --- Image ------------------------------------------------------- */}
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas-2">
        {image ? (
          <img
            src={image}
            alt={`${dish.name} - ${dish.description || 'FoodFusion menu item'}`}
            title={dish.name}
            onError={() => setImageFailed(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
            <UtensilsCrossed className="h-9 w-9 text-brand-200 dark:text-brand-400/50" strokeWidth={1.5} />
          </span>
        )}

        {/* Badges. Only truthful ones: category and "New" from createdAt. */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {dish.category?.name && (
            <span className="rounded-full bg-charcoal/75 px-2.5 py-1 text-[0.65rem] font-semibold text-white backdrop-blur">
              {dish.category.name}
            </span>
          )}
          {isNew(dish.createdAt) && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[0.65rem] font-bold text-charcoal">
              New
            </span>
          )}
        </div>

        {onToggleFavorite && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggleFavorite(dish.id)}
            disabled={isPending}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 disabled:opacity-60 dark:bg-charcoal/80"
          >
            <motion.span
              key={String(isFavorite)}
              initial={{ scale: isFavorite ? 0.5 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-charcoal-muted dark:text-body-muted'
                }`}
              />
            </motion.span>
          </motion.button>
        )}

        {/* Quick view reveals on hover, but is always reachable by keyboard
            (focus-within keeps it visible for focus users). */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onQuickView(dish)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-charcoal shadow-lg backdrop-blur transition-transform hover:scale-105 dark:bg-charcoal/90 dark:text-body"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick view
            </button>
          </div>
        )}

        {unavailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-charcoal/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-charcoal">
              Unavailable
            </span>
          </span>
        )}
      </div>

      {/* --- Body -------------------------------------------------------- */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base leading-snug font-semibold text-body">{dish.name}</h3>
          <span className="font-display text-base font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
            {money(dish.price)}
          </span>
        </div>

        {dish.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-body-muted">{dish.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {dish.prepTimeMinutes ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-body-faint">
              <Clock className="h-3.5 w-3.5" />
              {dish.prepTimeMinutes} min
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => onAdd(dish)}
            disabled={unavailable}
            aria-label={
              unavailable
                ? `${dish.name} is currently unavailable`
                : `Add ${dish.name} to your order${inCart ? ` (${quantity} in cart)` : ''}`
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              inCart
                ? 'bg-brand-700 text-white hover:bg-brand-800'
                : 'bg-gold-500 text-charcoal hover:-translate-y-0.5 hover:bg-gold-400'
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {quantity} added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
