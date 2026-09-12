import { Link } from 'react-router-dom'
import { Users, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react'

function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export function RecentCustomersCard({ customers = [], isLoading = false }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rule/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-body">Recent Diners</h3>
            <span className="text-[11px] text-body-faint">Registered customer profiles</span>
          </div>
        </div>
        <Link
          to="/dashboard/customers"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* List */}
      <div className="my-2 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-rule/40 last:border-0">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-3.5 w-28 rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-8 text-center text-xs text-body-muted">
            No customer accounts found.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-rule/60">
            {customers.slice(0, 5).map((customer) => {
              const initials = (customer.fullName || 'User')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <li
                  key={customer.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-2 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-canvas-2 border border-rule text-xs font-bold text-body">
                      {initials}
                    </span>

                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-bold text-body max-w-[130px] sm:max-w-[160px]">
                        {customer.fullName}
                      </span>
                      <span className="truncate text-[11px] text-body-muted max-w-[130px] sm:max-w-[160px]">
                        {customer.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-none">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md border border-rule bg-canvas-2 px-1.5 py-0.5 text-[10px] font-semibold text-body-muted">
                        <ShoppingBag className="h-2.5 w-2.5" />
                        {customer._count?.orders ?? 0} orders
                      </span>
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          customer.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40'
                            : 'bg-canvas-2 text-body-muted border-rule'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-[10px] text-body-faint">
                      Joined {formatTimeAgo(customer.createdAt)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-rule/60">
        <Link
          to="/dashboard/customers"
          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline block text-center"
        >
          Manage all restaurant diners & accounts →
        </Link>
      </div>
    </div>
  )
}

