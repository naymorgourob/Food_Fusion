import { STAFF_STATUS_CONFIG } from '@/features/staff/staffHelpers'

export function StaffStatusBadge({ isActive }) {
  const config = isActive ? STAFF_STATUS_CONFIG.ACTIVE : STAFF_STATUS_CONFIG.INACTIVE

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badgeClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass} ${
          isActive ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  )
}

