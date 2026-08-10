import { motion } from 'framer-motion'
import { Pencil, Trash2, Clock, Eye, UtensilsCrossed } from 'lucide-react'
import { getImageUrl } from '@/constants'
import { money } from '@/utils/format'

// A dish counts as "New" for the same window UI-03's customer-facing
// MenuDishCard uses — one definition of what "new" means, reused here
// rather than redefined, so an admin and a customer never see a dish
// flagged New on one screen and not the other.
const NEW_FOR_DAYS = 14

function isNew(createdAt) {
  if (!createdAt) return false
  const age = Date.now() - new Date(createdAt).getTime()
  return age >= 0 && age < NEW_FOR_DAYS * 24 * 60 * 60 * 1000
}

/**
 * One dish, as a card, in the Admin Menu Management grid (UI-08.1).
 *
 * Replaces a DataTable row: a dish is a small photo plus five facts an
 * admin scans quickly while stocking the menu for the week, not tabular
 * data to sort by column. Every value shown is a real column on Food —
 * there is no "Featured" badge here, because Food has no isFeatured
 * field (see the design note in MenuItemsPage.jsx for what was
 * requested and why it isn't shown).
 */
export function AdminDishCard({ dish, onEdit, onDelete, onView }) {
  const image = getImageUrl(dish.imageUrl)
  const unavailable = !dish.isAvailable

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-rule bg-card transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-900/8 ${
        unavailable ? 'opacity-75' : ''
      }`}
    >
      {/* --- Image ------------------------------------------------------- */}
      <button
        type="button"
        onClick={() => onView(dish)}
        aria-label={`View details for ${dish.name}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-canvas-2 text-left"
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-canvas-2 dark:from-brand-900/50 dark:to-canvas-2">
            <UtensilsCrossed className="h-8 w-8 text-brand-200 dark:text-brand-400/50" strokeWidth={1.5} />
          </span>
        )}

        <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-charcoal/75 px-2.5 py-1 text-[0.65rem] font-semibold text-white backdrop-blur">
            {dish.category?.name}
          </span>
          {isNew(dish.createdAt) && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[0.65rem] font-bold text-charcoal">New</span>
          )}
        </div>

        <span
          className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${
            unavailable
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200'
              : 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200'
          }`}
        >
          {unavailable ? 'Unavailable' : 'Available'}
        </span>

        <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 opacity-0 backdrop-blur-[1px] transition-all duration-200 group-hover:bg-charcoal/30 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-charcoal shadow dark:bg-charcoal/90 dark:text-body">
            <Eye className="h-3.5 w-3.5" />
            Quick view
          </span>
        </span>
      </button>

      {/* --- Body -------------------------------------------------------- */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-sm leading-snug font-semibold text-body">{dish.name}</h3>
          <span className="font-display text-sm font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
            {money(dish.price)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {dish.prepTimeMinutes ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-body-faint">
              <Clock className="h-3.5 w-3.5" />
              {dish.prepTimeMinutes} min
            </span>
          ) : (
            <span className="text-xs text-body-faint">—</span>
          )}

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(dish)}
              aria-label={`Edit ${dish.name}`}
              className="rounded-lg p-2 text-body-muted transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(dish)}
              aria-label={`Delete ${dish.name}`}
              className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
