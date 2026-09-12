import { Users, UserCheck, UserX, Briefcase } from 'lucide-react'

export function StaffStatsSummary({ staff, activeStatusFilter, onStatusFilterChange }) {
  const total = staff.length
  const activeCount = staff.filter((s) => s.isActive).length
  const inactiveCount = total - activeCount
  const uniquePositions = new Set(staff.map((s) => s.position).filter(Boolean)).size

  const cards = [
    {
      label: 'Total Staff',
      value: total,
      sublabel: 'Team members',
      icon: Users,
      tone: 'brand',
      onClick: () => onStatusFilterChange(''),
      isActive: activeStatusFilter === '',
    },
    {
      label: 'Active On Duty',
      value: activeCount,
      sublabel: 'Can log in & work shifts',
      icon: UserCheck,
      tone: 'success',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'ACTIVE' ? '' : 'ACTIVE'),
      isActive: activeStatusFilter === 'ACTIVE',
    },
    {
      label: 'Inactive Accounts',
      value: inactiveCount,
      sublabel: 'Access suspended',
      icon: UserX,
      tone: 'muted',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'INACTIVE' ? '' : 'INACTIVE'),
      isActive: activeStatusFilter === 'INACTIVE',
    },
    {
      label: 'Positions Filled',
      value: uniquePositions,
      sublabel: 'Unique job titles',
      icon: Briefcase,
      tone: 'gold',
      onClick: null,
      isActive: false,
    },
  ]

  const toneStyles = {
    brand: 'border-brand-200 bg-brand-50/50 text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300',
    success: 'border-success/30 bg-success-soft/30 text-success dark:bg-success-soft/15',
    muted: 'border-border bg-surface-2 text-ink-muted',
    gold: 'border-gold-200 bg-gold-50/50 text-gold-700 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-300',
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isClickable = Boolean(card.onClick)
        const Component = isClickable ? 'button' : 'div'

        return (
          <Component
            key={card.label}
            type={isClickable ? 'button' : undefined}
            onClick={card.onClick}
            className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
              card.isActive
                ? `${toneStyles[card.tone]} ring-2 ring-brand-500/20 shadow-sm`
                : 'border-rule bg-card hover:border-brand-200'
            } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-muted">{card.label}</span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl ${toneStyles[card.tone]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-body leading-none">
                {card.value}
              </span>
              <span className="mt-1 text-[11px] text-body-faint">{card.sublabel}</span>
            </div>
          </Component>
        )
      })}
    </div>
  )
}

