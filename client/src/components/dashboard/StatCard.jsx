/**
 * Reused for summary cards across dashboard modules —
 * one component, one visual language for "here is a number that matters."
 */
export function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-body-faint">
          {title}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-2xl font-bold tracking-tight text-body">{value}</span>
        {description && <p className="text-xs text-body-muted">{description}</p>}
      </div>
    </div>
  )
}
