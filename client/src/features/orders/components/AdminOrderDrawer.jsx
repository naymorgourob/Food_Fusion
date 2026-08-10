import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserRound, Clock, MapPin, Phone, ScrollText, CalendarClock, ChefHat, Receipt } from 'lucide-react'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { PaymentStatusBadge } from '@/features/orders/components/PaymentStatusBadge'
import { AdminOrderTimeline } from '@/features/orders/components/AdminOrderTimeline'
import { ORDER_STATUS_LABELS, orderGrandTotal, getScheduledDineInTimes } from '@/features/orders/constants'
import { ORDER_TYPE_ICONS } from '@/features/orders/staffOrderHelpers'
import { orderNo, money } from '@/utils/format'

// Matches order.service.js's updateOrderStatus branch guard exactly — a
// delivery order is never "Ready to Serve," a dine-in/takeaway order is
// never "On the Way" — so Admin is never offered a transition the server
// would reject.
const STATUS_OPTIONS_BY_TYPE = {
  DINE_IN: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
  TAKEAWAY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
  DELIVERY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED'],
}

function toLocalInputValue(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function Row({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-brand-700 dark:text-brand-400" />
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">{label}</span>
        <span className="text-sm break-words text-body">{children}</span>
      </div>
    </div>
  )
}

/**
 * Full order detail + every admin/staff action, as a slide-in drawer
 * (UI-08.4) — supersedes OrderDetailsModal.jsx for Admin Order
 * Management. OrderDetailsModal was built on Modal.jsx, the same shell
 * every Add/Edit form across the Admin Dashboard uses; redesigning it in
 * place would have restyled every one of those. This is a fresh
 * component instead, following the same pattern StaffOrderDrawer
 * (UI-07) already established.
 *
 * Every handler is the same one OrderDetailsModal called: status change,
 * staff assignment, estimated time. Nothing new was added to the API —
 * this adds two things the old modal never showed at all: a real
 * timeline (AdminOrderTimeline, reusing the exact stage vocabulary the
 * customer's own tracking page uses) and the order's real payment status
 * from order.bill.
 */
export function AdminOrderDrawer({
  order,
  isOpen,
  onClose,
  onStatusChange,
  isUpdatingStatus,
  assignableStaff,
  onAssignStaff,
  isAssigningStaff,
  onUpdateEstimatedTime,
  isUpdatingEstimatedTime,
}) {
  // Lazy initializers, not an effect: the parent remounts this drawer with
  // key={order.id} whenever a different order is opened, so these only
  // ever need to be set once per mount.
  const [readyTimeInput, setReadyTimeInput] = useState(() => toLocalInputValue(order?.estimatedReadyTime))
  const [deliveryTimeInput, setDeliveryTimeInput] = useState(() => toLocalInputValue(order?.estimatedDeliveryTime))

  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!order) return null

  const TypeIcon = ORDER_TYPE_ICONS[order.orderType] ?? ORDER_TYPE_ICONS.DINE_IN
  const scheduled = getScheduledDineInTimes(order)

  function handleEstimatedTimeSubmit(event) {
    event.preventDefault()
    const payload = {}
    if (order.orderType !== 'DELIVERY') {
      payload.estimatedReadyTime = readyTimeInput ? new Date(readyTimeInput).toISOString() : null
    } else {
      payload.estimatedDeliveryTime = deliveryTimeInput ? new Date(deliveryTimeInput).toISOString() : null
    }
    onUpdateEstimatedTime(payload)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close order details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${orderNo(order.orderNumber)}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-canvas shadow-2xl"
          >
            <header className="flex flex-none items-center justify-between border-b border-rule px-5 py-4">
              <div className="flex items-center gap-2.5">
                <TypeIcon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                <h2 className="font-display text-lg font-semibold text-body">{orderNo(order.orderNumber)}</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close order details"
                className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
                {/* --- Left: everything actionable ------------------- */}
                <div className="flex flex-col gap-6">
                  {/* --- Customer + order summary ------------------- */}
                  <section className="grid grid-cols-2 gap-4 rounded-2xl border border-rule bg-card p-4">
                    <Row icon={UserRound} label="Customer">
                      {order.customer.fullName}
                    </Row>
                    <Row icon={Clock} label="Placed at">
                      {new Date(order.createdAt).toLocaleString()}
                    </Row>
                    <Row icon={ChefHat} label="Table">
                      {order.table ? `Table ${order.table.number}` : '—'}
                    </Row>
                    <Row icon={ScrollText} label="Total">
                      {money(orderGrandTotal(order))}
                    </Row>
                  </section>

                  {/* --- Payment ---------------------------------------- */}
                  <section className="flex items-center justify-between gap-4 rounded-2xl border border-rule bg-card p-4">
                    <Row icon={Receipt} label="Payment">
                      {order.bill ? `Invoice ${orderNo(order.bill.billNumber)}` : 'No invoice generated yet'}
                    </Row>
                    <PaymentStatusBadge bill={order.bill} />
                  </section>

                  {order.orderType === 'DELIVERY' && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                      <Row icon={MapPin} label="Delivering to">
                        {order.deliveryAddress}
                      </Row>
                      <Row icon={Phone} label="Contact">
                        {order.deliveryPhone}
                      </Row>
                      <Row icon={ScrollText} label="Delivery charge">
                        {money(order.deliveryCharge ?? 0)}
                      </Row>
                    </section>
                  )}

                  {order.orderType === 'TAKEAWAY' && order.scheduledPickupTime && (
                    <section className="rounded-2xl border border-rule bg-card p-4">
                      <Row icon={Clock} label="Requested pickup time">
                        {new Date(order.scheduledPickupTime).toLocaleString()}
                      </Row>
                    </section>
                  )}

                  {scheduled && (
                    <section className="flex flex-col gap-2.5 rounded-2xl border border-gold-300 bg-gold-100/40 p-4 dark:border-gold-700 dark:bg-gold-100/5">
                      <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gold-700 uppercase dark:text-gold-300">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Scheduled dine-in
                      </span>
                      <Row icon={Clock} label="Arrival">
                        {scheduled.arrival.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Row>
                      <Row icon={ChefHat} label="Kitchen starts">
                        {scheduled.prepStartsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Row>
                      <Row icon={ScrollText} label="Guests">
                        {order.guestCount}
                      </Row>
                    </section>
                  )}

                  {order.specialInstructions && (
                    <section className="flex items-start gap-2.5 rounded-2xl border border-rule bg-card p-4">
                      <ScrollText className="mt-0.5 h-4 w-4 flex-none text-body-faint" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium tracking-wide text-body-faint uppercase">
                          Special instructions
                        </span>
                        <span className="text-sm text-body-muted">{order.specialInstructions}</span>
                      </div>
                    </section>
                  )}

                  {/* --- Items ------------------------------------------ */}
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold tracking-wide text-body-faint uppercase">Items</h3>
                    <ul className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-4">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-body">
                            {item.quantity}× {item.menuItem.name}
                          </span>
                          <span className="text-body-muted">{money(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* --- Status --------------------------------------- */}
                  <section className="flex flex-col gap-2">
                    <label htmlFor="admin-order-status" className="text-xs font-semibold tracking-wide text-body-faint uppercase">
                      Update status
                    </label>
                    <select
                      id="admin-order-status"
                      value={order.status}
                      disabled={isUpdatingStatus}
                      onChange={(event) => onStatusChange(event.target.value)}
                      className="rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
                    >
                      {STATUS_OPTIONS_BY_TYPE[order.orderType].map((option) => (
                        <option key={option} value={option}>
                          {ORDER_STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </section>

                  {/* --- Assign staff ----------------------------------- */}
                  <section className="flex flex-col gap-2">
                    <label htmlFor="admin-order-assign" className="text-xs font-semibold tracking-wide text-body-faint uppercase">
                      Assign staff
                    </label>
                    <select
                      id="admin-order-assign"
                      value={order.assignedStaff?.id ?? ''}
                      disabled={isAssigningStaff}
                      onChange={(event) => onAssignStaff(event.target.value || null)}
                      className="rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
                    >
                      <option value="">Unassigned</option>
                      {assignableStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.fullName} {staff.position ? `(${staff.position})` : ''}
                        </option>
                      ))}
                    </select>
                  </section>

                  {/* --- Estimated time --------------------------------- */}
                  <form onSubmit={handleEstimatedTimeSubmit} className="flex flex-col gap-2">
                    <label
                      htmlFor="admin-order-eta"
                      className="text-xs font-semibold tracking-wide text-body-faint uppercase"
                    >
                      {order.orderType === 'DELIVERY' ? 'Estimated delivery time' : 'Estimated ready time'}
                    </label>
                    <input
                      id="admin-order-eta"
                      type="datetime-local"
                      value={order.orderType === 'DELIVERY' ? deliveryTimeInput : readyTimeInput}
                      onChange={(event) =>
                        order.orderType === 'DELIVERY'
                          ? setDeliveryTimeInput(event.target.value)
                          : setReadyTimeInput(event.target.value)
                      }
                      className="rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingEstimatedTime}
                      className="mt-1 w-fit rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingEstimatedTime ? 'Saving…' : 'Save estimated time'}
                    </button>
                  </form>
                </div>

                {/* --- Right: timeline ------------------------------- */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold tracking-wide text-body-faint uppercase">Order timeline</h3>
                  <div className="rounded-2xl border border-rule bg-card p-4">
                    <AdminOrderTimeline order={order} />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
