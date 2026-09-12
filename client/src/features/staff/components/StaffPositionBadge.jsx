import { getPositionTone } from '@/features/staff/staffHelpers'

export function StaffPositionBadge({ position }) {
  if (!position) return null
  const tone = getPositionTone(position)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {position}
    </span>
  )
}

