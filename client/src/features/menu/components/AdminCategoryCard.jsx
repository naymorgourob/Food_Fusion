import { motion } from 'framer-motion'
import { Pencil, Trash2, UtensilsCrossed, Eye } from 'lucide-react'

/**
 * One category, as a card, in the Admin Category Management grid
 * (UI-08.2).
 *
 * Replaces a DataTable row for the same reason Menu Management moved to
 * cards (UI-08.1): a category is a handful of facts an admin scans while
 * organising the menu, not tabular data to sort by column.
 *
 * There is no photo here — Category has no imageUrl column anywhere in
 * the schema, no upload middleware, nothing. Rather than invent a photo
 * upload the backend can't store, every card gets the same tinted icon
 * medallion used for "no photo" placeholders throughout the redesigned
 * app, so the grid still looks premium without pretending an image
 * exists. Every other field shown — name, description, item count,
 * status — is a real column or a real computed value (itemCount comes
 * straight from listCategories' _count.foods).
 */
export function AdminCategoryCard({ category, onEdit, onDelete, onView }) {
  const inactive = !category.isActive

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-900/8 ${
        inactive ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onView(category)}
          aria-label={`View details for ${category.name}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-canvas-2 text-brand-700 transition-transform group-hover:scale-105 dark:from-brand-900/50 dark:to-canvas-2 dark:text-brand-400">
            <UtensilsCrossed className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-display text-base leading-snug font-semibold text-body">{category.name}</span>
            <span className="text-xs text-body-faint">
              {category.itemCount} {category.itemCount === 1 ? 'dish' : 'dishes'}
            </span>
          </span>
        </button>

        <span
          className={`flex-none rounded-full px-2.5 py-1 text-[0.65rem] font-bold whitespace-nowrap ${
            inactive
              ? 'bg-canvas-2 text-body-faint'
              : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
          }`}
        >
          {inactive ? 'Inactive' : 'Active'}
        </span>
      </div>

      {category.description ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-body-muted">{category.description}</p>
      ) : (
        <p className="text-sm text-body-faint italic">No description added yet.</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule pt-3">
        <button
          type="button"
          onClick={() => onView(category)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
        >
          <Eye className="h-3.5 w-3.5" />
          View details
        </button>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
