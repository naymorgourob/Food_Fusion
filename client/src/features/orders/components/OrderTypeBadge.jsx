import { UtensilsCrossed, Bike, ShoppingBag } from 'lucide-react'

const TYPE_META = {
  DINE_IN: { label: 'Dine-In', icon: UtensilsCrossed },
  DELIVERY: { label: 'Delivery', icon: Bike },
  TAKEAWAY: { label: 'Takeaway', icon: ShoppingBag },
}

export function OrderTypeBadge({ orderType }) {
  const { label, icon: Icon } = TYPE_META[orderType]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink-muted">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </span>
  )
}
