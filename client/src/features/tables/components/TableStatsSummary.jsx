/**
 * Quick-glance status counts shown at the top of the Tables page (UI-08.6).
 *
 * Counts are derived from the already-fetched tables array — no extra API
 * call. Clicking a pill fires the onFilterByStatus callback to instantly
 * filter the grid to that status.
 */

import { TABLE_STATUS_CONFIG } from '@/features/tables/tableHelpers'

const STAT_ORDER = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE']

export function TableStatsSummary({ tables, activeFilter, onFilterByStatus }) {
  const counts = STAT_ORDER.reduce((acc, status) => {
    acc[status] = tables.filter((t) => t.status === status).length
    return acc
  }, {})

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_ORDER.map((status) => {
        const config = TABLE_STATUS_CONFIG[status]
        const isActive = activeFilter === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilterByStatus(isActive ? '' : status)}
            aria-pressed={isActive}
            className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-all hover:shadow-md ${
              isActive
                ? `${config.badgeClass} border-current shadow-sm`
                : 'border-rule bg-card hover:border-brand-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 flex-none rounded-full ${config.dotClass}`} />
              <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${isActive ? '' : 'text-body-faint'}`}>
                {config.label}
              </span>
            </span>
            <span className={`font-display text-2xl font-bold leading-none ${isActive ? '' : 'text-body'}`}>
              {counts[status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
