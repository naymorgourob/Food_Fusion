import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  Ban,
  ChefHat,
  ClipboardList,
  Clock,
  Check,
  Search,
  CalendarClock,
  AlertTriangle,
  ScrollText,
} from 'lucide-react'
import { StaffOrderDrawer } from '@/features/orders/components/StaffOrderDrawer'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { QuickEtaModal } from '@/features/orders/components/QuickEtaModal'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal, isScheduledPrepDue, getScheduledDineInTimes } from '@/features/orders/constants'
import {
  minutesWaiting,
  minutesFromNow,
  priorityFor,
  nextKitchenAction,
} from '@/features/orders/staffOrderHelpers'
import { orderNo, money } from '@/utils/format'

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'new', label: 'New Orders' },
  { id: 'preparing', label: 'In Kitchen' },
  { id: 'ready', label: 'Ready for Pass' },
  { id: 'urgent', label: 'Urgent / Delayed' },
]

export default function ChefOrdersPage() {
  const { orders } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [assignableStaff, setAssignableStaff] = useState([])
  const [viewingOrder, setViewingOrder] = useState(null)
  const [etaOrder, setEtaOrder] = useState(null)
  const [isUpdatingEta, setIsUpdatingEta] = useState(false)
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
    let newCount = 0
    let prepCount = 0
    let readyCount = 0
    let urgentCount = 0

    for (const ord of allOrdersList) {
      if (ord.status === 'PENDING') newCount++
      if (['ACCEPTED', 'PREPARING'].includes(ord.status)) prepCount++
      if (ord.status === 'READY') readyCount++
      if (priorityFor(ord) === 'high' && ['PENDING', 'ACCEPTED', 'PREPARING'].includes(ord.status)) {
        urgentCount++
      }
    }

    return {
      all: allOrdersList.length,
      new: newCount,
      preparing: prepCount,
      ready: readyCount,
      urgent: urgentCount,
    }
  }, [allOrdersList])

  // Filtered orders based on search query and active tab
  const filtered = useMemo(() => {
    let list = allOrdersList

    // Filter by tab
    if (currentTab === 'new') {
      list = list.filter((o) => o.status === 'PENDING')
    } else if (currentTab === 'preparing') {
      list = list.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status))
    } else if (currentTab === 'ready') {
      list = list.filter((o) => o.status === 'READY')
    } else if (currentTab === 'urgent') {
      list = list.filter(
        (o) => priorityFor(o) === 'high' && ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status),
      )
    }

    // Filter by query
    if (query) {
      list = list.filter(
        (o) =>
          String(o.orderNumber).includes(query) ||
          o.customer?.fullName?.toLowerCase().includes(query) ||
          o.items?.some((it) => it.menuItem?.name?.toLowerCase().includes(query)),
      )
    }

    // Sort: Urgent & oldest waiting orders first
    return [...list].sort((a, b) => {
      const pRank = { high: 0, medium: 1, normal: 2 }
      const diff = (pRank[priorityFor(a)] ?? 2) - (pRank[priorityFor(b)] ?? 2)
      if (diff !== 0) return diff
      return minutesWaiting(b) - minutesWaiting(a)
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

  async function handleAdvanceStatus(order, nextStatus) {
    setUpdatingOrderId(order.id)
    try {
      await orderService.updateOrderStatus(order.id, nextStatus)
      orders.refetch()
    } catch {
      orders.refetch()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleSaveEta(order, targetIso) {
    setIsUpdatingEta(true)
    try {
      const payload = {}
      if (order.orderType === 'DELIVERY') {
        payload.estimatedDeliveryTime = targetIso
      } else {
        payload.estimatedReadyTime = targetIso
      }
      await orderService.updateEstimatedTime(order.id, payload)

      // If order is still PENDING, also advance to ACCEPTED
      if (order.status === 'PENDING') {
        await orderService.updateOrderStatus(order.id, 'ACCEPTED')
      }

      setEtaOrder(null)
      orders.refetch()
    } finally {
      setIsUpdatingEta(false)
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
      {/* Page Title & Live Counter */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Kitchen Orders</h1>
        <p className="text-sm text-body-muted">
          Manage kitchen ticket lifecycle from incoming orders through prep, plating, and completion.
        </p>
      </div>

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
                  : 'bg-card text-body-muted hover:bg-canvas-2 hover:text-body'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.id === 'urgent' && count > 0
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
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
            placeholder="Search order #, customer name, or dish…"
            className="w-full rounded-xl border border-rule bg-canvas-2 py-2 pr-4 pl-9 text-xs text-body transition placeholder:text-body-faint focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div className="text-xs text-body-faint hidden sm:block">
          Showing {filtered.length} of {allOrdersList.length} total orders
        </div>
      </div>

      {/* Orders List / Cards */}
      {orders.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={query ? 'No matching tickets' : 'No orders in this view'}
          description={
            query
              ? 'Try adjusting your search criteria.'
              : 'New tickets will arrive automatically when placed by customers.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => {
            const waited = minutesWaiting(order)
            const priority = priorityFor(order)
            const isUrgent = priority === 'high'
            const action = nextKitchenAction(order.status, order.orderType)
            const isUpdatingThis = updatingOrderId === order.id
            const scheduled = getScheduledDineInTimes(order)
            const prepDue = isScheduledPrepDue(order)

            const etaIso =
              order.orderType === 'DELIVERY' ? order.estimatedDeliveryTime : order.estimatedReadyTime
            const etaDiffMin = minutesFromNow(etaIso)

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col justify-between rounded-3xl border bg-card p-5 shadow-sm transition hover:shadow-md ${
                  isUrgent ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20' : 'border-rule'
                }`}
              >
                <div>
                  {/* Top Ticket Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-body">
                          {orderNo(order.orderNumber)}
                        </span>
                        <OrderTypeBadge orderType={order.orderType} />
                      </div>
                      <span className="text-xs text-body-muted">{order.customer?.fullName || 'Walk-in'}</span>
                      {order.table?.tableNumber && (
                        <span className="text-[0.7rem] font-semibold text-brand-700 dark:text-brand-400">
                          Table #{order.table.tableNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[0.65rem] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3" /> Urgent ({waited}m)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Dine-In Alert */}
                  {scheduled && (
                    <div
                      className={`mt-3 flex items-center justify-between rounded-xl p-2.5 text-xs ${
                        prepDue
                          ? 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'bg-canvas-2 text-body-muted'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                        Arrival:{' '}
                        <strong>
                          {scheduled.arrival.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </strong>
                      </span>
                      {prepDue && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[0.65rem] font-bold text-charcoal">
                          Prep due now
                        </span>
                      )}
                    </div>
                  )}

                  {/* Special Instructions Highlight */}
                  {order.specialInstructions && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                      <ScrollText className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-600" />
                      <div>
                        <span className="font-bold">Special Note: </span>
                        <span>{order.specialInstructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="mt-3 border-t border-rule pt-3">
                    <ul className="flex flex-col gap-1.5 text-xs">
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

                  {/* ETA Display & Setter */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas-2 p-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-body-faint">
                      <Clock className="h-3.5 w-3.5" />
                      {etaIso ? (
                        <span
                          className={`font-semibold ${
                            etaDiffMin !== null && etaDiffMin < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-body'
                          }`}
                        >
                          ETA:{' '}
                          {new Date(etaIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{' '}
                          {etaDiffMin !== null && `(${etaDiffMin > 0 ? `+${etaDiffMin}m` : 'overdue'})`}
                        </span>
                      ) : (
                        <span>No ETA set</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEtaOrder(order)}
                      className="text-[0.7rem] font-bold text-brand-700 hover:underline dark:text-brand-400"
                    >
                      {etaIso ? 'Change ETA' : 'Set ETA'}
                    </button>
                  </div>
                </div>

                {/* Footer Controls & Next Action */}
                <div className="mt-4 border-t border-rule pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] text-body-faint">
                      Placed {waited}m ago · {money(orderGrandTotal(order))}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(order)}
                        title="View Full Details"
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

                  {/* Prominent Action Button */}
                  {action && (
                    <div className="mt-3">
                      {order.status === 'PENDING' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(order, 'ACCEPTED')}
                            disabled={isUpdatingThis}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-canvas-2 py-2 text-xs font-semibold text-body hover:bg-canvas disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Quick Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => setEtaOrder(order)}
                            disabled={isUpdatingThis}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-2 text-xs font-bold text-white transition hover:bg-brand-800 shadow-sm disabled:opacity-50"
                          >
                            <ChefHat className="h-3.5 w-3.5" /> Accept + ETA
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(order, action.status)}
                          disabled={isUpdatingThis}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800 shadow-sm disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          {isUpdatingThis ? 'Updating status…' : action.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Quick ETA Presets Modal */}
      <QuickEtaModal
        order={etaOrder}
        isOpen={Boolean(etaOrder)}
        onClose={() => setEtaOrder(null)}
        onSave={handleSaveEta}
        isSaving={isUpdatingEta}
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
