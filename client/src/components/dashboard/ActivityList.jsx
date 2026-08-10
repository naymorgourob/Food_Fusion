// Reused for Recent Orders / Recent Users / Recent Reservations today, and
// for any future "latest N of X" list — one row shape (primary/secondary/
// meta + status badge) covers all three without three bespoke components.
export function ActivityList({ title, items }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <li key={item.primary} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-ink">{item.primary}</span>
              <span className="text-xs text-ink-muted">{item.secondary}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[item.status] ?? STATUS_STYLES.default}`}
              >
                {item.status}
              </span>
              <span className="text-xs text-ink-faint">{item.meta}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const STATUS_STYLES = {
  Completed: 'bg-success-soft text-success',
  Active: 'bg-success-soft text-success',
  Pending: 'bg-warning-soft text-warning',
  Confirmed: 'bg-info-soft text-info',
  default: 'bg-surface-2 text-ink-muted',
}
