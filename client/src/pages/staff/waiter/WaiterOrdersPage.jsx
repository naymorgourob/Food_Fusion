import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  Ban,
  Plus,
  BellRing,
  ClipboardList,
  Clock,
  Check,
  ScrollText,
  Search,
  CalendarClock,
  Armchair,
  ShoppingBag,
} from 'lucide-react'
import { StaffOrderDrawer } from '@/features/orders/components/StaffOrderDrawer'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { TakeOrderModal } from '@/features/orders/components/TakeOrderModal'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal, isScheduledPrepDue, getScheduledDineInTimes } from '@/features/orders/constants'
import { minutesWaiting } from '@/features/orders/staffOrderHelpers'
import { orderNo, money } from '@/utils/format'

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'ready', label: 'Ready to Serve', highlight: true },
  { id: 'preparing', label: 'In Kitchen' },
  { id: 'new', label: 'New / Sent' },
  { id: 'served', label: 'Served to Table' },
]

export default function WaiterOrdersPage() {
  const { orders, tables } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [assignableStaff, setAssignableStaff] = useState([])
  const [viewingOrder, setViewingOrder] = useState(null)
  const [isTakeOrderOpen, setIsTakeOrderOpen] = useState(false)
  const [takeOrderTableId, setTakeOrderTableId] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const currentTab = searchParams.get('tab') || 'all'
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  useEffect(() => {
    orderService.fetchAssignableStaff().then(setAssignableStaff).catch(() => setAssignableStaff([]))
  }, [])

  const allOrdersList = orders?.orders || []

  // Counts for each tab
  const counts = useMemo(() => {
    let readyCount = 0
    let prepCount = 0
    let newCount = 0
    let servedCount = 0

    for (const ord of allOrdersList) {
      if (ord.status === 'READY') readyCount++
      else if (['ACCEPTED', 'PREPARING'].includes(ord.status)) prepCount++
      else if (ord.status === 'PENDING') newCount++
      else if (ord.status === 'SERVED' || ord.status === 'ON_THE_WAY') servedCount++
    }

    return {
      all: allOrdersList.length,
      ready: readyCount,
      preparing: prepCount,
      new: newCount,
      served: servedCount,
    }
  }, [allOrdersList])

  // Filtered orders based on search query and active tab
  const filtered = useMemo(() => {
    let list = allOrdersList

    // Filter by tab
    if (currentTab === 'ready') {
      list = list.filter((o) => o.status === 'READY')
    } else if (currentTab === 'preparing') {
      list = list.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status))
    } else if (currentTab === 'new') {
      list = list.filter((o) => o.status === 'PENDING')
    } else if (currentTab === 'served') {
      list = list.filter((o) => o.status === 'SERVED' || o.status === 'ON_THE_WAY')
    }

    // Filter by query
    if (query) {
      list = list.filter(
        (o) =>
          String(o.orderNumber).includes(query) ||
          (o.table?.tableNumber && String(o.table.tableNumber).includes(query)) ||
          o.customer?.fullName?.toLowerCase().includes(query) ||
          o.items?.some((it) => it.menuItem?.name?.toLowerCase().includes(query)),
      )
    }

    // Sort: READY first (needs waiter pickup), then PENDING, then oldest
    return [...list].sort((a, b) => {
      const statusRank = { READY: 0, PENDING: 1, PREPARING: 2, ACCEPTED: 3, SERVED: 4, COMPLETED: 5, CANCELLED: 6 }
      const diff = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9)
      if (diff !== 0) return diff
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [allOrdersList, currentTab, query])

  function handleTabChange(tabId) {
    const nextParams = new URLSearchParams(searchParams)
    if (tabId === 'all') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', tabId)
    }
    setSearchParams(nextParams)
  }

  async function handleMarkServed(order) {
    setUpdatingOrderId(order.id)
    try {
      const targetStatus = order.orderType === 'DELIVERY' ? 'ON_THE_WAY' : 'SERVED'
      await orderService.updateOrderStatus(order.id, targetStatus)
      orders.refetch()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleCompleteOrder(order) {
    setUpdatingOrderId(order.id)
    try {
      await orderService.updateOrderStatus(order.id, 'COMPLETED')
      orders.refetch()
      tables?.refetch?.()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleConfirmCancel() {
    setIsCancelling(true)
    setCancelError('')
    try {
      await orderService.cancelOrder(cancelTarget.id)
      setCancelTarget(null)
      orders.refetch()
      tables?.refetch?.()
    } catch (error) {
      setCancelError(error.response?.data?.message ?? 'Failed to cancel order.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header with "Take New Order" Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Floor Orders</h1>
          <p className="text-sm text-body-muted">
            Service floor command — monitor customer tickets, serve plated dishes, and take table orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTakeOrderTableId(null)
            setIsTakeOrderOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-brand-800 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Take New Order
        </button>
      </div>

      {/* Action Banner for Ready Orders */}
      {counts.ready > 0 && currentTab !== 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md animate-bounce">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-sm">
                {counts.ready} {counts.ready === 1 ? 'Order is' : 'Orders are'} Ready on the Pass!
              </p>
              <p className="text-xs opacity-80">Plated dishes waiting to be served to guests.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleTabChange('ready')}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
          >
            Serve Now &rarr;
          </button>
        </motion.div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-rule pb-2">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id
          const count = counts[tab.id] ?? 0
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : tab.highlight && count > 0
                  ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200'
                  : 'bg-card text-body-muted hover:bg-canvas-2 hover:text-body'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.highlight && count > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-canvas-2 text-body-faint'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-rule bg-card p-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchParams.get('q') ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const nextParams = new URLSearchParams(searchParams)
              if (val) nextParams.set('q', val)
              else nextParams.delete('q')
              setSearchParams(nextParams)
            }}
            placeholder="Search table #, order #, dish name, or customer…"
            className="w-full rounded-xl border border-rule bg-canvas-2 py-2 pr-4 pl-9 text-xs text-body transition placeholder:text-body-faint focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div className="text-xs text-body-faint hidden sm:block">
          Showing {filtered.length} of {allOrdersList.length} tickets
        </div>
      </div>

      {/* Orders Cards Grid */}
      {orders.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={query ? 'No matching tickets' : 'No orders in this category'}
          description={
            query
              ? 'Try adjusting your search criteria.'
              : 'Take a new order from a table or check back when orders arrive.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => {
            const waited = minutesWaiting(order)
            const isReady = order.status === 'READY'
            const isServed = order.status === 'SERVED' || order.status === 'ON_THE_WAY'
            const isUpdating = updatingOrderId === order.id
            const scheduled = getScheduledDineInTimes(order)
            const prepDue = isScheduledPrepDue(order)

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col justify-between rounded-3xl border bg-card p-5 shadow-sm transition hover:shadow-md ${
                  isReady
                    ? 'border-emerald-400 bg-emerald-50/10 ring-2 ring-emerald-500/30 dark:border-emerald-600'
                    : 'border-rule'
                }`}
              >
                <div>
                  {/* Top Bar: Table Number & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {order.table?.tableNumber ? (
                          <span className="flex items-center gap-1.5 rounded-xl bg-brand-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                            <Armchair className="h-3.5 w-3.5" />
                            Table #{order.table.tableNumber}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-xl bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body-muted">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Takeaway
                          </span>
                        )}
                        <span className="font-display text-sm font-semibold text-body">
                          {orderNo(order.orderNumber)}
                        </span>
                      </div>
                      <span className="mt-1 text-xs text-body-muted font-medium">
                        {order.customer?.fullName || 'Walk-in Guest'}
                      </span>
                    </div>

                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Ready alert callout banner directly on card */}
                  {isReady && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-100/90 p-2.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                      <BellRing className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <span>Plated & Ready to Serve!</span>
                    </div>
                  )}

                  {/* Scheduled Dine-In Alert */}
                  {scheduled && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas-2 p-2 text-xs text-body-muted">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                        Arrival:{' '}
                        <strong>
                          {scheduled.arrival.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </strong>
                      </span>
                      {prepDue && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[0.65rem] font-bold text-charcoal">
                          Prep due
                        </span>
                      )}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50/80 p-2.5 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                      <ScrollText className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-600" />
                      <div>
                        <span className="font-bold">Guest Request: </span>
                        <span>{order.specialInstructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="mt-3 border-t border-rule pt-2.5">
                    <ul className="flex flex-col gap-1 text-xs">
                      {order.items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between">
                          <span className="font-medium text-body">
                            <span className="inline-block w-6 font-bold text-brand-700 dark:text-brand-400">
                              {it.quantity}×
                            </span>
                            {it.menuItem?.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Timing & Service Actions */}
                <div className="mt-4 border-t border-rule pt-3">
                  <div className="flex items-center justify-between text-[0.7rem] text-body-faint">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {waited}m ago · {money(orderGrandTotal(order))}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(order)}
                        title="View Full Ticket"
                        className="rounded-lg p-1.5 text-body-muted hover:bg-canvas-2 hover:text-body"
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
                          title="Cancel Order"
                          className="rounded-lg p-1.5 text-body-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Waiter Action Buttons */}
                  <div className="mt-3">
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => handleMarkServed(order)}
                        disabled={isUpdating}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {isUpdating ? 'Serving…' : 'Serve to Table'}
                      </button>
                    ) : isServed ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteOrder(order)}
                        disabled={isUpdating}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rule bg-canvas-2 py-2 text-xs font-semibold text-body hover:bg-canvas disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {isUpdating ? 'Completing…' : 'Complete Dining'}
                      </button>
                    ) : order.status === 'PENDING' ? (
                      <div className="flex items-center justify-center rounded-xl bg-canvas-2 py-2 text-xs font-medium text-body-muted">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500 animate-spin" />
                        Sent to Kitchen · Awaiting Prep
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-xl bg-canvas-2 py-2 text-xs font-medium text-body-muted">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-brand-500" />
                        Cooking in Kitchen
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Take Order Modal */}
      <TakeOrderModal
        isOpen={isTakeOrderOpen}
        onClose={() => setIsTakeOrderOpen(false)}
        tables={tables?.tables || []}
        preselectedTableId={takeOrderTableId}
        onOrderCreated={() => {
          orders.refetch()
          tables?.refetch?.()
        }}
      />

      {/* Full Order Drawer */}
      <StaffOrderDrawer
        key={viewingOrder?.id ?? 'none'}
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onStatusChange={async (status) => {
          setIsUpdatingStatus(true)
          try {
            const updated = await orderService.updateOrderStatus(viewingOrder.id, status)
            setViewingOrder(updated)
            orders.refetch()
            tables?.refetch?.()
          } finally {
            setIsUpdatingStatus(false)
          }
        }}
        isUpdatingStatus={isUpdatingStatus}
        assignableStaff={assignableStaff}
        onAssignStaff={async (staffId) => {
          setIsAssigningStaff(true)
          try {
            const updated = await orderService.assignStaff(viewingOrder.id, staffId)
            setViewingOrder(updated)
            orders.refetch()
          } finally {
            setIsAssigningStaff(false)
          }
        }}
        isAssigningStaff={isAssigningStaff}
        onUpdateEstimatedTime={async (payload) => {
          try {
            const updated = await orderService.updateEstimatedTime(viewingOrder.id, payload)
            setViewingOrder(updated)
            orders.refetch()
          } catch {
            orders.refetch()
          }
        }}
        isUpdatingEstimatedTime={false}
      />

      {/* Cancel Order Confirm */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Cancel ${cancelTarget ? orderNo(cancelTarget.orderNumber) : ''}? This action cannot be undone.`}
        isConfirming={isCancelling}
        error={cancelError}
        dismissLabel="Keep Order"
        confirmLabel="Cancel Order"
        confirmingLabel="Cancelling…"
      />
    </div>
  )
}

