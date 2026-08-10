import { Award } from 'lucide-react'

// Tier colors are drawn from the existing design tokens rather than
// literal metal colours — a real gold/bronze hex would be the first
// off-palette colour in the app. Each tier still reads as distinct
// because the label is always present beside the icon, never colour alone.
const TIER_STYLES = {
  BRONZE: 'bg-surface-2 text-ink-muted',
  SILVER: 'bg-info-soft text-info',
  GOLD: 'bg-warning-soft text-warning',
  PLATINUM: 'bg-ember-50 text-ember-600',
}

const TIER_LABELS = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
}

export function MembershipBadge({ level, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  const iconClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${TIER_STYLES[level]} ${sizeClasses}`}>
      <Award className={iconClasses} strokeWidth={2} />
      {TIER_LABELS[level]}
    </span>
  )
}
