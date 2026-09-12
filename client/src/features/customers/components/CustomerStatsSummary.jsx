import { Users, UserCheck, UserX, ShoppingBag } from 'lucide-react'

/**
 * CustomerStatsSummary — top-level statistics bar (UI-08.7).
 * Clicking an active/inactive card toggles that filter instantly.
 */
export function CustomerStatsSummary({ customers, activeStatusFilter, onStatusFilterChange }) {
  const total = customers.length
  const activeCount = customers.filter((c) => c.isActive).length
  const inactiveCount = total - activeCount
  const totalOrders = customers.reduce((sum, c) => sum + (c._count?.orders ?? 0), 0)

  const cards = [
    {
      label: 'Total Customers',
      value: total,
      sublabel: 'Registered accounts',
      icon: Users,
      tone: 'brand',
      onClick: () => onStatusFilterChange(''),
      isActive: activeStatusFilter === '',
    },
    {
      label: 'Active Accounts',
      value: activeCount,
      sublabel: 'Can place orders & book',
      icon: UserCheck,
      tone: 'success',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'ACTIVE' ? '' : 'ACTIVE'),
      isActive: activeStatusFilter === 'ACTIVE',
    },
    {
      label: 'Inactive Accounts',
      value: inactiveCount,
      sublabel: 'Login suspended',
      icon: UserX,
      tone: 'muted',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'INACTIVE' ? '' : 'INACTIVE'),
      isActive: activeStatusFilter === 'INACTIVE',
    },
    {
      label: 'Lifetime Orders',
      value: totalOrders,
      sublabel: 'Placed by customers',
      icon: ShoppingBag,
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
