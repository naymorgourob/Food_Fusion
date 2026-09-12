import { TABLE_STATUS_CONFIG } from '@/features/tables/tableHelpers'

/**
 * TableStatusBadge — pill badge with a pulsing dot for AVAILABLE,
 * consistent across every table component in the redesign (UI-08.6).
 */
export function TableStatusBadge({ status, size = 'sm' }) {
  const config = TABLE_STATUS_CONFIG[status] ?? TABLE_STATUS_CONFIG.INACTIVE

  const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[0.65rem]'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClass} ${config.badgeClass}`}>
      <span
        className={`h-1.5 w-1.5 flex-none rounded-full ${config.dotClass} ${
          status === 'AVAILABLE' ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  )
}
