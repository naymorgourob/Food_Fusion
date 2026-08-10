import { motion } from 'framer-motion'
import { Eye, Ban, ChefHat, UserRound } from 'lucide-react'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { PaymentStatusBadge } from '@/features/orders/components/PaymentStatusBadge'
import { ORDER_TYPE_ICONS } from '@/features/orders/staffOrderHelpers'
import { orderGrandTotal, isScheduledPrepDue } from '@/features/orders/constants'
import { orderNo, money } from '@/utils/format'

/**
 * One order, as a row, in Admin Order Management (UI-08.4).
 *
 * A row rather than an image-first card (unlike Menu/Category
 * Management's grids) — an order has no photo identity, and the ten
 * fields the spec asks for (ID, customer, type, items, total, payment
 * status, order status, time, assigned staff, actions) read far better
 * scanned left-to-right than stacked in a card. Every field shown is
 * real: assignedStaff and bill both come from the same ORDER_INCLUDE the
 * API already returns on every order.
 */
export function AdminOrderRow({ order, onView, onCancel }) {
  const TypeIcon = ORDER_TYPE_ICONS[order.orderType] ?? ORDER_TYPE_ICONS.DINE_IN
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const cancellable = order.status !== 'CANCELLED' && order.status !== 'COMPLETED'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-rule bg-card p-4 transition-shadow hover:shadow-md hover:shadow-brand-900/5"
    >
      <div className="flex min-w-[7.5rem] flex-col">
        <span className="font-display text-sm font-semibold text-body">{orderNo(order.orderNumber)}</span>
        <span className="text-xs text-body-faint">
          {new Date(order.createdAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      <span className="min-w-[8rem] truncate text-sm text-body-muted">{order.customer.fullName}</span>

      <div className="flex items-center gap-1.5">
        <OrderTypeBadge orderType={order.orderType} />
        {isScheduledPrepDue(order) && (
          <span className="flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[0.65rem] font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
            <ChefHat className="h-3 w-3" /> Start prep
          </span>
        )}
      </div>

      <span className="flex items-center gap-1.5 text-sm text-body-muted">
        <TypeIcon className="h-3.5 w-3.5 text-body-faint" />
        {itemCount} item{itemCount === 1 ? '' : 's'}
      </span>

      <span className="font-display text-sm font-semibold text-body">{money(orderGrandTotal(order))}</span>

      <PaymentStatusBadge bill={order.bill} />

      <OrderStatusBadge status={order.status} />

      {order.assignedStaff && (
        <span className="flex items-center gap-1.5 text-xs text-body-faint">
          <UserRound className="h-3.5 w-3.5" />
          {order.assignedStaff.fullName}
        </span>
      )}

      <div className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => onView(order)}
          aria-label={`View ${orderNo(order.orderNumber)}`}
          className="rounded-lg p-2 text-body-muted transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
        >
          <Eye className="h-4 w-4" />
        </button>
        {cancellable && (
          <button
            type="button"
            onClick={() => onCancel(order)}
            aria-label={`Cancel ${orderNo(order.orderNumber)}`}
            className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Ban className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
