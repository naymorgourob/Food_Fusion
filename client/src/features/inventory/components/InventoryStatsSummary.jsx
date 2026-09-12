import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function InventoryStatsSummary({ items = [], activeStatusFilter, onStatusFilterChange }) {
  const total = items.length
  const inStockCount = items.filter((item) => item.status === 'IN_STOCK').length
  const lowStockCount = items.filter((item) => item.status === 'LOW_STOCK').length
  const outOfStockCount = items.filter((item) => item.status === 'OUT_OF_STOCK').length

  const cards = [
    {
      label: 'Total Items',
      value: total,
      sublabel: 'Ingredients & supplies',
      icon: Package,
      tone: 'brand',
      onClick: () => onStatusFilterChange(''),
      isActive: activeStatusFilter === '',
    },
    {
      label: 'In Stock',
      value: inStockCount,
      sublabel: 'Healthy supply levels',
      icon: CheckCircle2,
      tone: 'success',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'IN_STOCK' ? '' : 'IN_STOCK'),
      isActive: activeStatusFilter === 'IN_STOCK',
    },
    {
      label: 'Low Stock',
      value: lowStockCount,
      sublabel: 'Below minimum threshold',
      icon: AlertTriangle,
      tone: 'warning',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'LOW_STOCK' ? '' : 'LOW_STOCK'),
      isActive: activeStatusFilter === 'LOW_STOCK',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount,
      sublabel: 'Needs immediate replenishment',
      icon: XCircle,
      tone: 'danger',
      onClick: () =>
        onStatusFilterChange(activeStatusFilter === 'OUT_OF_STOCK' ? '' : 'OUT_OF_STOCK'),
      isActive: activeStatusFilter === 'OUT_OF_STOCK',
    },
  ]

  const toneStyles = {
    brand: 'border-brand-200 bg-brand-50/50 text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300',
    success: 'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300',
    warning: 'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300',
    danger: 'border-red-200 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300',
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

