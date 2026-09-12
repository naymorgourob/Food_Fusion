import { Link } from 'react-router-dom'

export function QuickActionButton({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-rule bg-card p-4 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:scale-95"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-transform group-hover:scale-110 dark:text-brand-400">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="text-xs font-bold text-body group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {label}
      </span>
    </Link>
  )
}
