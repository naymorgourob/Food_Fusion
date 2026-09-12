import { motion } from 'framer-motion'
import { Eye, UserCheck, UserX, Mail, Phone, CalendarDays, ShoppingBag } from 'lucide-react'
import { CustomerStatusBadge } from '@/features/customers/components/CustomerStatusBadge'
import { getImageUrl } from '@/constants'

export function AdminCustomerRow({ customer, onView, onToggleStatus, isToggling }) {
  const avatarUrl = getImageUrl(customer.profileImage)
  const initials = customer.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const ordersCount = customer._count?.orders ?? 0
  const reservationsCount = customer._count?.reservations ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        customer.isActive ? 'border-rule hover:border-brand-200' : 'border-border bg-surface-2/40 opacity-75'
      }`}
    >
      {/* Customer identity */}
      <div className="flex items-center gap-3.5 min-w-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-11 w-11 flex-none rounded-xl object-cover ring-1 ring-rule"
          />
        ) : (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white shadow-sm">
            {initials}
          </span>
        )}

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-sm font-bold text-body">
              {customer.fullName}
            </span>
            <CustomerStatusBadge isActive={customer.isActive} />
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body-muted">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-body-faint" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{customer.email}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-body-faint" />
              <span>{customer.phone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between gap-4 border-t border-rule pt-3 sm:border-t-0 sm:pt-0">
        {/* Orders & Bookings pill badges */}
        <div className="flex items-center gap-2">
          <span
            title="Total lifetime orders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body-muted"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>{ordersCount} {ordersCount === 1 ? 'order' : 'orders'}</span>
          </span>

          <span
            title="Total reservations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body-muted"
          >
            <CalendarDays className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
            <span>{reservationsCount} {reservationsCount === 1 ? 'booking' : 'bookings'}</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView(customer)}
            aria-label={`View details for ${customer.fullName}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(customer)}
            disabled={isToggling}
            aria-label={
              customer.isActive
                ? `Deactivate account for ${customer.fullName}`
                : `Activate account for ${customer.fullName}`
            }
            title={customer.isActive ? 'Suspend customer account' : 'Restore customer account'}
            className={`rounded-xl p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              customer.isActive
                ? 'text-body-faint hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            {customer.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
