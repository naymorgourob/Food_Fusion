import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Eye, Ban, ChefHat, ClipboardList } from 'lucide-react'
import { StaffOrderDrawer } from '@/features/orders/components/StaffOrderDrawer'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal, isScheduledPrepDue } from '@/features/orders/constants'
import { orderNo, money } from '@/utils/format'

/**
 * Staff's full order history (UI-07) — every order, not just active ones
 * (that's Kitchen Queue). Same data source (useOrders, shared via
 * StaffLayout) and the same four actions the Admin OrdersPage already
 * has: view details, change status, assign staff, set estimated time,
 * cancel. Nothing here calls an endpoint the old DataTable version didn't
 * already call.
 *
 * Replaces a DataTable with cards for the same reason the customer pages
 * moved off DataTable in earlier parts: an order is a handful of related
 * facts staff scan quickly between kitchen trips, not a dataset to sort
 * by column.
 */
export default function StaffOrdersPage() {
  const { orders } = useOutletContext()
  const [searchParams] = useSearchParams()

  const [assignableStaff, setAssignableStaff] = useState([])
  const [viewingOrder, setViewingOrder] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)
  const [isUpdatingEstimatedTime, setIsUpdatingEstimatedTime] = useState(false)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    orderService.fetchAssignableStaff().then(setAssignableStaff).catch(() => setAssignableStaff([]))
  }, [])

  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!query) return orders.orders
    return orders.orders.filter(
      (order) =>
        String(order.orderNumber).includes(query) ||
        order.customer.fullName.toLowerCase().includes(query),
    )
  }, [orders.orders, query])

  async function handleStatusChange(status) {
    setIsUpdatingStatus(true)
    try {
      const updated = await orderService.updateOrderStatus(viewingOrder.id, status)
      setViewingOrder(updated)
      orders.refetch()
    } catch {
      orders.refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleAssignStaff(staffId) {
    setIsAssigningStaff(true)
    try {
      const updated = await orderService.assignStaff(viewingOrder.id, staffId)
      setViewingOrder(updated)
      orders.refetch()
    } catch {
      orders.refetch()
    } finally {
      setIsAssigningStaff(false)
    }
  }

  async function handleUpdateEstimatedTime(payload) {
    setIsUpdatingEstimatedTime(true)
    try {
      const updated = await orderService.updateEstimatedTime(viewingOrder.id, payload)
      setViewingOrder(updated)
      orders.refetch()
    } catch {
      orders.refetch()
    } finally {
      setIsUpdatingEstimatedTime(false)
    }
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      await orderService.cancelOrder(cancelTarget.id)
      setCancelTarget(null)
      orders.refetch()
    } catch (error) {
      setCancelError(error.response?.data?.message ?? 'Failed to cancel order.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Orders</h1>
        <p className="text-sm text-body-muted">
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
          {query && ` matching "${searchParams.get('q')}"`}
        </p>
      </div>

      {orders.isLoading ? (
        <div className="grid gap-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={query ? 'No matching orders' : 'No orders yet'}
          description={query ? 'Try a different order number or name.' : 'Orders will appear here as they come in.'}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-rule bg-card p-4 transition-shadow hover:shadow-md hover:shadow-brand-900/5 sm:gap-5"
            >
              <div className="flex min-w-[7rem] flex-col">
                <span className="font-display text-sm font-semibold text-body">{orderNo(order.orderNumber)}</span>
                <span className="text-xs text-body-faint">{new Date(order.createdAt).toLocaleString()}</span>
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

              <span className="text-sm text-body-muted">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
              </span>

              <span className="font-display text-sm font-semibold text-body">{money(orderGrandTotal(order))}</span>

              <OrderStatusBadge status={order.status} />

              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => setViewingOrder(order)}
                  aria-label={`View ${orderNo(order.orderNumber)}`}
                  className="rounded-lg p-2 text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelError('')
                      setCancelTarget(order)
                    }}
                    aria-label={`Cancel ${orderNo(order.orderNumber)}`}
                    className="rounded-lg p-2 text-body-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StaffOrderDrawer
        key={viewingOrder?.id ?? 'none'}
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
        assignableStaff={assignableStaff}
        onAssignStaff={handleAssignStaff}
        isAssigningStaff={isAssigningStaff}
        onUpdateEstimatedTime={handleUpdateEstimatedTime}
        isUpdatingEstimatedTime={isUpdatingEstimatedTime}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Cancel ${cancelTarget ? orderNo(cancelTarget.orderNumber) : ''}? This cannot be undone.`}
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep Order"
        confirmLabel="Cancel Order"
        confirmingLabel="Cancelling…"
      />
    </div>
  )
}
