import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, UserRound, Check, ChefHat, ScrollText } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import { orderNo } from '@/utils/format'
import {
  ORDER_TYPE_ICONS,
  minutesWaiting,
  minutesFromNow,
  priorityFor,
  nextKitchenAction,
} from '@/features/orders/staffOrderHelpers'

const PRIORITY_STYLE = {
  high: 'border-red-300 dark:border-red-800',
  medium: 'border-gold-300 dark:border-gold-700',
  normal: 'border-rule',
}

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-gold-100 text-gold-700 dark:bg-gold-100/10 dark:text-gold-300',
  normal: null, // no badge — a normal-priority order doesn't need a flag
}

const PRIORITY_LABEL = { high: 'Running late', medium: 'Watch this one' }

/**
 * One active order in the Kitchen Queue (UI-07).
 *
 * Every field is real: order number, customer, type, items, assigned
 * staff, and the ETA staff themselves set via the existing "estimated
 * time" control (OrderDetailsModal / updateEstimatedTime). Priority is
 * derived from how long the order has been waiting in its current status
 * — see staffOrderHelpers.priorityFor — never a fabricated flag.
 *
 * "Start Cooking" / "Mark Ready" call the same updateOrderStatus the
 * existing Admin order modal uses; nothing new was added to the API.
 */
export function KitchenOrderCard({ order, onAdvance, isUpdating }) {
  const [, forceTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceTick((tick) => tick + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const TypeIcon = ORDER_TYPE_ICONS[order.orderType] ?? ORDER_TYPE_ICONS.DINE_IN
  const waited = minutesWaiting(order)
  const priority = priorityFor(order)
  const action = nextKitchenAction(order.status)

  const eta = order.orderType === 'DELIVERY' ? order.estimatedDeliveryTime : order.estimatedReadyTime
  const etaDiffMin = minutesFromNow(eta)

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-brand-900/5 ${PRIORITY_STYLE[priority]}`}
    >
      {/* --- Header ------------------------------------------------- */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-display text-base font-semibold text-body">
            <TypeIcon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
            {orderNo(order.orderNumber)}
          </span>
          <span className="text-xs text-body-faint">{order.customer.fullName}</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-canvas-2 px-2.5 py-1 text-[0.7rem] font-semibold text-body-muted">
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          {PRIORITY_BADGE[priority] && (
            <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${PRIORITY_BADGE[priority]}`}>
              {PRIORITY_LABEL[priority]}
            </span>
          )}
        </div>
      </div>

      {/* --- Items --------------------------------------------------- */}
      <ul className="flex flex-col gap-1 border-t border-rule pt-3 text-sm">
        {order.items.slice(0, 4).map((item) => (
          <li key={item.id} className="flex justify-between text-body-muted">
            <span className="truncate pr-2">
              {item.quantity}× {item.menuItem.name}
            </span>
          </li>
        ))}
        {order.items.length > 4 && (
          <li className="text-xs text-body-faint">+{order.items.length - 4} more</li>
        )}
      </ul>

      {order.specialInstructions && (
        <div className="flex items-start gap-2 rounded-xl bg-canvas-2 px-3 py-2">
          <ScrollText className="mt-0.5 h-3.5 w-3.5 flex-none text-body-faint" />
          <span className="text-xs leading-relaxed text-body-muted">{order.specialInstructions}</span>
        </div>
      )}

      {/* --- Timing + staff ------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-xs">
        <span className="flex items-center gap-1.5 text-body-faint">
          <Clock className="h-3.5 w-3.5" />
          Waiting {waited}m
        </span>

        {etaDiffMin !== null && (
          <span
            className={`flex items-center gap-1.5 font-semibold ${
              etaDiffMin < 0 ? 'text-red-600 dark:text-red-300' : 'text-brand-700 dark:text-brand-400'
            }`}
          >
            <ChefHat className="h-3.5 w-3.5" />
            {etaDiffMin < 0 ? `${Math.abs(etaDiffMin)}m over` : `${etaDiffMin}m to target`}
          </span>
        )}

        <span className="text-body-faint">{itemCount} item{itemCount === 1 ? '' : 's'}</span>

        {order.assignedStaff && (
          <span className="flex items-center gap-1.5 text-body-faint">
            <UserRound className="h-3.5 w-3.5" />
            {order.assignedStaff.fullName}
          </span>
        )}
      </div>

      {/* --- Action ----------------------------------------------------- */}
      {action && (
        <button
          type="button"
          onClick={() => onAdvance(order, action.status)}
          disabled={isUpdating}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-brand-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {isUpdating ? 'Updating…' : action.label}
        </button>
      )}
    </motion.article>
  )
}
