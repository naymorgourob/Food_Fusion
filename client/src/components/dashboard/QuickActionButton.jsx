import { Link } from 'react-router-dom'

// One link-styled-as-a-button, reused for every quick action — a future
// module adding its own shortcut here is a one-line addition, not a new
// component.
export function QuickActionButton({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center transition-colors hover:border-ember-300 hover:bg-ember-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember-50 text-ember-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="text-xs font-medium text-ink">{label}</span>
    </Link>
  )
}
