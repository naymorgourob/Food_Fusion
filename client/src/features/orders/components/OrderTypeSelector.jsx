import { UtensilsCrossed, Bike, ShoppingBag } from 'lucide-react'

const OPTIONS = [
  { value: 'DINE_IN', label: 'Dine-In', description: 'Eat at the restaurant', icon: UtensilsCrossed },
  { value: 'DELIVERY', label: 'Delivery', description: 'Delivered to your address', icon: Bike },
  { value: 'TAKEAWAY', label: 'Takeaway', description: 'Pick up yourself', icon: ShoppingBag },
]

// Step 1 of the ordering wizard — "the ordering flow should change
// depending on the selected order type," so this is the one choice that
// has to be made before anything else in the form even renders.
export function OrderTypeSelector({ value, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {OPTIONS.map(({ value: optionValue, label, description, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onSelect(optionValue)}
          aria-pressed={value === optionValue}
          className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all ${
            value === optionValue
              ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-400 dark:bg-brand-900/30 dark:ring-brand-900'
              : 'border-rule bg-card hover:-translate-y-0.5 hover:border-brand-200'
          }`}
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              value === optionValue ? 'bg-brand-700 text-white' : 'bg-canvas-2 text-body-muted'
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="font-display text-sm font-semibold text-body">{label}</span>
          <span className="text-xs text-body-muted">{description}</span>
        </button>
      ))}
    </div>
  )
}
