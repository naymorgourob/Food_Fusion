import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight, Utensils, ShoppingBag, Truck } from 'lucide-react'
import { orderGrandTotal } from '@/features/orders/constants'
import { money, orderNo } from '@/utils/format'

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

const ORDER_STATUS_CLASSES = {
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
  PREPARING: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40 animate-pulse',
  READY: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
  ACCEPTED: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40',
}

export function RecentOrdersCard({ orders = [], isLoading = false }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rule/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-body">Recent Orders</h3>
            <span className="text-[11px] text-body-faint">Latest guest purchases</span>
          </div>
        </div>
        <Link
          to="/dashboard/orders"
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
                  <div className="skeleton h-3 w-40 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-body-muted">
            No recent orders recorded.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-rule/60">
            {orders.slice(0, 5).map((order) => {
              const total = orderGrandTotal(order)
              const badgeClass =
                ORDER_STATUS_CLASSES[order.status] ||
                'bg-canvas-2 text-body-muted border-rule'

              return (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-2 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-body">
                        {orderNo(order.orderNumber)}
                      </span>
                      <span className="truncate text-xs font-medium text-body max-w-[120px] sm:max-w-[150px]">
                        {order.customer?.fullName || 'Guest Diner'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-[11px] text-body-muted">
                      <span>
                        {order.orderType === 'DINE_IN'
                          ? order.table
                            ? `Table ${order.table.number}`
                            : 'Dine-in'
                          : order.orderType === 'DELIVERY'
                            ? 'Delivery'
                            : 'Takeaway'}
                      </span>
                      <span>·</span>
                      <span className="font-mono font-bold text-body">
                        {money(total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-none">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[10px] text-body-faint">
                      {formatTimeAgo(order.createdAt)}
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
          to="/dashboard/orders"
          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline block text-center"
        >
          Manage all restaurant orders →
        </Link>
      </div>
    </div>
  )
}

