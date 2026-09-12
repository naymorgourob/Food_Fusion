export function ActivityList({ title, items }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-card p-5 shadow-xs">
      <h3 className="font-display text-sm font-bold text-body">{title}</h3>
      <ul className="flex flex-col divide-y divide-rule/60">
        {!items || items.length === 0 ? (
          <li className="py-4 text-center text-xs text-body-muted">No recent activity.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.primary}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-body">{item.primary}</span>
                <span className="text-xs text-body-muted">{item.secondary}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_STYLES[item.status] ?? STATUS_STYLES.default
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-xs text-body-faint">{item.meta}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

const STATUS_STYLES = {
  Completed:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
  Active:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
  Pending:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300',
  Confirmed:
    'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300',
  default: 'border-rule bg-canvas-2 text-body-muted',
}
