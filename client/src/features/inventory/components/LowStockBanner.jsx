import { useState } from 'react'
import { AlertTriangle, ChevronRight, X, ArrowRight } from 'lucide-react'
import { UNIT_LABELS } from '@/features/inventory/inventoryHelpers'

export function LowStockBanner({ items = [], onFilterUrgent }) {
  const [dismissed, setDismissed] = useState(false)

  const urgentItems = items.filter(
    (item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK'
  )

  if (dismissed || urgentItems.length === 0) return null

  const outOfStockCount = urgentItems.filter((i) => i.status === 'OUT_OF_STOCK').length
  const lowStockCount = urgentItems.length - outOfStockCount

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-sm font-bold text-amber-900 dark:text-amber-200">
              Stock Alert: {urgentItems.length} {urgentItems.length === 1 ? 'item requires' : 'items require'} restock
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
            {outOfStockCount > 0 && `${outOfStockCount} out of stock`}
            {outOfStockCount > 0 && lowStockCount > 0 && ' · '}
            {lowStockCount > 0 && `${lowStockCount} below minimum threshold`}
          </p>

          {/* Top critical items tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {urgentItems.slice(0, 3).map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:border-amber-800/60 dark:bg-black/30 dark:text-amber-200"
              >
                <span>{item.itemName}:</span>
                <strong className={item.status === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-amber-700'}>
                  {Number(item.quantity)} / {Number(item.minStockLevel)} {UNIT_LABELS[item.unit]}
                </strong>
              </span>
            ))}
            {urgentItems.length > 3 && (
              <span className="self-center text-[10px] font-medium text-amber-700 dark:text-amber-300">
                +{urgentItems.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={onFilterUrgent}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-amber-700"
        >
          <span>View Shortages</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert"
          className="rounded-lg p-1.5 text-amber-700/60 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-300/60 dark:hover:bg-amber-900/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

