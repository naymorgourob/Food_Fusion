/**
 * Reused for every stat on Dashboard Home today, and by every future module's
 * own summary cards (Orders, Inventory, Reports all need the same shape) —
 * one component, one visual language for "here is a number that matters."
 */
export function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {title}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-50 text-ember-600">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-2xl font-bold text-ink">{value}</span>
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </div>
    </div>
  )
}
