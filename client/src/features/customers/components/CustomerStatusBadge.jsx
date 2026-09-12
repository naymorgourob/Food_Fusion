import { CUSTOMER_STATUS_CONFIG } from '@/features/customers/customerHelpers'

/**
 * CustomerStatusBadge — pill badge with status dot indicator (UI-08.7).
 */
export function CustomerStatusBadge({ isActive, size = 'sm' }) {
  const config = isActive ? CUSTOMER_STATUS_CONFIG.ACTIVE : CUSTOMER_STATUS_CONFIG.INACTIVE
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[0.65rem]'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClass} ${config.badgeClass}`}>
      <span
        className={`h-1.5 w-1.5 flex-none rounded-full ${config.dotClass} ${
          isActive ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  )
}
