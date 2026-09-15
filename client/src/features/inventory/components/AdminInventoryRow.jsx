import { motion } from 'framer-motion'
import { Pencil, Trash2, Layers } from 'lucide-react'
import { InventoryStatusBadge } from '@/features/inventory/components/InventoryStatusBadge'
import { UNIT_LABELS } from '@/features/inventory/inventoryHelpers'

export function AdminInventoryRow({ item, onEdit, onDelete }) {
  const qty = Number(item.quantity)
  const threshold = Number(item.minStockLevel)
  const unitLabel = UNIT_LABELS[item.unit] ?? item.unit

  // Calculate percentage of threshold (e.g. 100% means healthy, <100% means low)
  const ratioPct = threshold > 0 ? Math.min(100, Math.max(0, Math.round((qty / threshold) * 100))) : 100

  const progressBarColor =
    item.status === 'OUT_OF_STOCK'
      ? 'bg-red-500'
      : item.status === 'LOW_STOCK'
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        item.status === 'OUT_OF_STOCK'
          ? 'border-red-200/80 bg-red-50/20 dark:border-red-900/40'
          : item.status === 'LOW_STOCK'
          ? 'border-amber-200/80 bg-amber-50/15 dark:border-amber-900/40'
          : 'border-rule hover:border-brand-200'
      }`}
    >
      {/* Item info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-canvas border border-rule text-body-muted">
          <Layers className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-display text-sm font-bold text-body">
              {item.itemName}
            </span>
            <InventoryStatusBadge status={item.status} />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-body-muted">
            <span className="rounded-md bg-canvas-2 px-2 py-0.5 font-medium">
              {item.category}
            </span>
            <span>·</span>
            <span className="text-body-faint">
              Min threshold: <strong>{threshold} {unitLabel}</strong>
            </span>
          </div>
        </div>
      </div>

      {item.usages?.length > 0 && (
        <div className="border-t border-rule pt-3 text-xs text-body-muted">
          <p className="mb-1 font-semibold text-body">Usage history</p>
          <div className="flex flex-col gap-1">
            {item.usages.map((usage) => (
              <p key={usage.id}>
                {new Date(usage.usageDate).toLocaleDateString()} · used {Number(usage.quantityUsed)} {unitLabel} · remaining {Number(usage.remainingQuantity)} {unitLabel} · {usage.recordedBy?.fullName || 'Staff'}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Stock level & Controls */}
      <div className="flex items-center justify-between gap-5 border-t border-rule pt-3 sm:border-t-0 sm:pt-0">
        {/* Quantity and Progress Bar */}
        <div className="flex flex-col gap-1 w-32 sm:w-40">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[11px] text-body-muted">Available:</span>
            <span className="font-display text-sm font-bold text-body">
              {qty} <span className="text-xs font-medium text-body-muted">{unitLabel}</span>
            </span>
          </div>

          {/* Visual stock health progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-2">
            <div
              className={`h-full transition-all duration-300 ${progressBarColor}`}
              style={{ width: `${ratioPct}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.itemName}`}
            title="Edit item details"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.itemName}`}
            title="Delete item"
            className="rounded-xl border border-rule bg-card p-1.5 text-body-faint transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

