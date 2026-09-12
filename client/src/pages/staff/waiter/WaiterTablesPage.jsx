import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Armchair,
  Users,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Info,
  UtensilsCrossed,
} from 'lucide-react'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'
import { TakeOrderModal } from '@/features/orders/components/TakeOrderModal'
import { StaffOrderDrawer } from '@/features/orders/components/StaffOrderDrawer'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal } from '@/features/orders/constants'
import { money, orderNo } from '@/utils/format'

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function formatTime(value) {
  if (!value) return ''
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-500/20',
    card: 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10 hover:border-emerald-400',
  },
  OCCUPIED: {
    label: 'Occupied',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 ring-1 ring-red-500/20',
    card: 'border-red-200/80 bg-red-50/20 dark:border-red-900/40 dark:bg-red-950/10 hover:border-red-400',
  },
  RESERVED: {
    label: 'Reserved',
    dot: 'bg-gold-500',
    badge: 'bg-gold-100 text-gold-800 dark:bg-gold-950/60 dark:text-gold-300 ring-1 ring-gold-500/20',
    card: 'border-gold-200/80 bg-gold-50/20 dark:border-gold-900/40 dark:bg-gold-950/10 hover:border-gold-400',
  },
  INACTIVE: {
    label: 'Unavailable',
    dot: 'bg-body-faint',
    badge: 'bg-canvas-2 text-body-faint',
    card: 'border-rule bg-canvas-2/50 opacity-60',
  },
}

export default function WaiterTablesPage() {
  const { tables, orders, reservations } = useOutletContext()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [isTakeOrderOpen, setIsTakeOrderOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const allTables = tables?.tables || []
  const allOrders = orders?.orders || []
  const allReservations = reservations?.reservations || []

  // Table status counts
  const counts = useMemo(() => {
    const res = { ALL: allTables.length, AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0 }
    for (const t of allTables) {
      if (res[t.status] !== undefined) {
        res[t.status]++
      }
    }
    return res
  }, [allTables])

  // Filtered and sorted tables
  const filteredTables = useMemo(() => {
    return allTables
      .filter((t) => {
        if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim()
          const matchesNum = String(t.number).includes(q)
          const matchesDesc = t.description?.toLowerCase().includes(q)
          if (!matchesNum && !matchesDesc) return false
        }
        return true
      })
      .sort((a, b) => a.number - b.number)
  }, [allTables, statusFilter, searchQuery])

  // Map of active orders by tableId
  const activeOrdersByTable = useMemo(() => {
    const map = new Map()
    for (const order of allOrders) {
      if (order.tableId && !['COMPLETED', 'CANCELLED'].includes(order.status)) {
        map.set(order.tableId, order)
      }
    }
    return map
  }, [allOrders])

  // Map of today's reservations by tableId
  const reservationsByTable = useMemo(() => {
    const map = new Map()
    for (const res of allReservations) {
      if (res.tableId && isToday(res.reservationDate) && res.status !== 'CANCELLED') {
        map.set(res.tableId, res)
      }
    }
    return map
  }, [allReservations])

  function handleTakeOrder(tableId) {
    setSelectedTableId(tableId)
    setIsTakeOrderOpen(true)
  }

  async function handleStatusChange(orderId, newStatus) {
    setIsUpdatingStatus(true)
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      await orders?.refetch?.()
      await tables?.refetch?.()
      if (viewingOrder?.id === orderId) {
        setViewingOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-body">Dining Floor Tables</h1>
            <span className="rounded-full bg-brand-100 dark:bg-brand-950/60 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20">
              {allTables.length} Tables
            </span>
          </div>
          <p className="text-sm text-body-muted">
            Floor management overview — seat guests, take dining orders, and monitor active table orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleTakeOrder(null)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Take New Order
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-rule bg-card p-1">
          {[
            { id: 'ALL', label: 'All Tables', count: counts.ALL },
            { id: 'AVAILABLE', label: 'Available', count: counts.AVAILABLE, dot: 'bg-emerald-500' },
            { id: 'OCCUPIED', label: 'Occupied', count: counts.OCCUPIED, dot: 'bg-red-500' },
            { id: 'RESERVED', label: 'Reserved', count: counts.RESERVED, dot: 'bg-gold-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-body-muted hover:bg-canvas-2 hover:text-body'
              }`}
            >
              {tab.dot && (
                <span
                  className={`h-2 w-2 rounded-full ${tab.dot} ${
                    statusFilter === tab.id ? 'ring-2 ring-white/40' : ''
                  }`}
                />
              )}
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-canvas-2 text-body-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by table #..."
            className="w-full rounded-xl border border-rule bg-card py-1.5 pl-9 pr-3 text-xs text-body placeholder:text-body-faint focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Info notice */}
      <p className="flex items-center gap-2 rounded-xl border border-rule bg-card px-4 py-2.5 text-xs text-body-muted shadow-xs">
        <Info className="h-4 w-4 flex-none text-brand-600 dark:text-brand-400" />
        Table status updates automatically when orders are placed and completed. Click on any table to take an order or view active dining status.
      </p>

      {/* Tables Grid */}
      {tables.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : filteredTables.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="No tables found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try changing your search query or status filter.'
              : 'No dining floor tables have been configured yet.'
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables.map((table) => {
            const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.INACTIVE
            const activeOrder = activeOrdersByTable.get(table.id)
            const reservation = reservationsByTable.get(table.id)
            const isAvailable = table.status === 'AVAILABLE'
            const isOccupied = table.status === 'OCCUPIED'
            const isReserved = table.status === 'RESERVED'

            return (
              <motion.div
                key={table.id}
                layout
                className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all duration-200 ${config.card}`}
              >
                <div>
                  {/* Card Header: Table number, capacity, and status badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-body">
                          Table {table.number}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-body-muted">
                          <Users className="h-3.5 w-3.5" />
                          {table.capacity}
                        </span>
                      </div>
                      {table.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-body-faint">
                          {table.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  {/* Body Content based on Table Status */}
                  <div className="mt-4">
                    {isOccupied && activeOrder ? (
                      <div className="flex flex-col gap-2 rounded-xl border border-red-200/60 bg-white/70 dark:border-red-900/50 dark:bg-card/70 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-body">
                            Order #{orderNo(activeOrder.id)}
                          </span>
                          <OrderStatusBadge status={activeOrder.status} />
                        </div>

                        <div className="flex items-center justify-between text-xs text-body-muted">
                          <span>
                            {activeOrder.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} items
                          </span>
                          <span className="font-bold text-body">
                            {money(orderGrandTotal(activeOrder))}
                          </span>
                        </div>

                        {activeOrder.status === 'READY' && (
                          <div className="flex items-center gap-1 text-[0.7rem] font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ready at pass! Deliver to table.
                          </div>
                        )}
                      </div>
                    ) : isReserved && reservation ? (
                      <div className="flex flex-col gap-1.5 rounded-xl border border-gold-200/70 bg-white/70 dark:border-gold-900/50 dark:bg-card/70 p-3 text-xs">
                        <div className="flex items-center justify-between font-semibold text-body">
                          <span>{reservation.customerName}</span>
                          <span className="text-gold-700 dark:text-gold-300">
                            {formatTime(reservation.reservationTime)}
                          </span>
                        </div>
                        <span className="text-body-muted">
                          {reservation.guestCount} guests booked
                        </span>
                        {reservation.specialRequest && (
                          <span className="line-clamp-1 text-[0.7rem] italic text-body-faint">
                            &ldquo;{reservation.specialRequest}&rdquo;
                          </span>
                        )}
                      </div>
                    ) : isAvailable ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300/60 bg-white/40 dark:border-emerald-800/40 dark:bg-card/40 p-4 text-center">
                        <Armchair className="h-6 w-6 text-emerald-600/70 dark:text-emerald-400/70" />
                        <span className="mt-1 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                          Table Ready for Seating
                        </span>
                        <span className="text-[0.7rem] text-body-faint">Seats up to {table.capacity} guests</span>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-body-faint">
                        Table is currently inactive.
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-rule/60">
                  {isOccupied && activeOrder ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewingOrder(activeOrder)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-2 text-xs font-semibold text-body shadow-xs transition hover:bg-canvas-2"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Order
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTakeOrder(table.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-800 shadow-xs"
                        title="Add items to table order"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Item
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTakeOrder(table.id)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-800"
                    >
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                      {isReserved ? 'Seat Guest & Take Order' : 'Take Table Order'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Take Order Modal */}
      <TakeOrderModal
        isOpen={isTakeOrderOpen}
        onClose={() => {
          setIsTakeOrderOpen(false)
          setSelectedTableId(null)
        }}
        tables={allTables}
        preselectedTableId={selectedTableId}
        onOrderCreated={() => {
          orders?.refetch?.()
          tables?.refetch?.()
        }}
      />

      {/* View Order Drawer */}
      <StaffOrderDrawer
        isOpen={Boolean(viewingOrder)}
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
        assignableStaff={[]}
      />
    </div>
  )
}
