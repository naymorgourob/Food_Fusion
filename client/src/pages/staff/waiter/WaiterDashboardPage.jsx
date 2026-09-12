import { useState, useMemo } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BellRing,
  UtensilsCrossed,
  CheckCircle2,
  Armchair,
  Users,
  CalendarClock,
  ArrowRight,
  Plus,
  Sparkles,
  ShoppingBag,
  ChefHat,
} from 'lucide-react'
import { ROUTES } from '@/constants'
import { Card, SectionTitle, SkeletonCard } from '@/components/customer/ui'
import { TakeOrderModal } from '@/features/orders/components/TakeOrderModal'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { StatusBadge as ReservationStatusBadge } from '@/features/reservations/components/StatusBadge'
import * as orderService from '@/features/orders/services/orderService'
import { orderGrandTotal } from '@/features/orders/constants'
import { orderNo, money } from '@/utils/format'

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

function KpiCard({ icon: Icon, label, value, to, subtext, tone = 'brand', highlight = false }) {
  const toneMap = {
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20',
    red: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500/20',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/20',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/20',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 ring-1 ring-purple-500/20',
  }

  const linkProps = to ? { as: Link, to } : {}

  return (
    <Card
      {...linkProps}
      interactive={Boolean(to)}
      className={`relative flex flex-col justify-between gap-3 p-4 transition-all hover:scale-[1.01] ${
        highlight ? 'ring-2 ring-emerald-500/50 shadow-md shadow-emerald-500/10' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${toneMap[tone] || toneMap.brand}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        {to && <ArrowRight className="h-4 w-4 text-body-faint" />}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-2xl font-bold text-body">{value}</span>
        <span className="truncate text-xs font-semibold text-body-muted">{label}</span>
        {subtext && <span className="truncate text-[0.7rem] text-body-faint">{subtext}</span>}
      </div>
      {highlight && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      )}
    </Card>
  )
}

export default function WaiterDashboardPage() {
  const { orders, reservations, tables } = useOutletContext()

  const [isTakeOrderOpen, setIsTakeOrderOpen] = useState(false)
  const [takeOrderTableId, setTakeOrderTableId] = useState(null)
  const [servingOrderId, setServingOrderId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const allOrders = orders?.orders || []
  const allReservations = reservations?.reservations || []
  const allTables = tables?.tables || []

  // Stats calculation
  const stats = useMemo(() => {
    let pendingCount = 0
    let preparingCount = 0
    let readyCount = 0

    for (const order of allOrders) {
      if (order.status === 'PENDING') pendingCount++
      if (['ACCEPTED', 'PREPARING'].includes(order.status)) preparingCount++
      if (order.status === 'READY') readyCount++
    }

    const todayReservations = allReservations.filter(
      (r) => isToday(r.reservationDate) && r.status !== 'CANCELLED',
    ).length

    const availableTables = allTables.filter((t) => t.status === 'AVAILABLE').length
    const occupiedTables = allTables.filter((t) => t.status === 'OCCUPIED').length

    return {
      pending: pendingCount,
      preparing: preparingCount,
      ready: readyCount,
      todayReservations,
      availableTables,
      occupiedTables,
    }
  }, [allOrders, allReservations, allTables])

  // Ready to serve orders (Urgent pass queue)
  const readyOrders = useMemo(() => {
    return allOrders.filter((o) => o.status === 'READY')
  }, [allOrders])

  // Today's upcoming reservations
  const todayReservationsList = useMemo(() => {
    return allReservations
      .filter((r) => isToday(r.reservationDate) && r.status !== 'CANCELLED')
      .sort((a, b) => (a.reservationTime > b.reservationTime ? 1 : -1))
      .slice(0, 6)
  }, [allReservations])

  // Floor tables preview (sorted by table number)
  const sortedTables = useMemo(() => {
    return [...allTables].sort((a, b) => a.number - b.number)
  }, [allTables])

  // Quick table status helper
  function getTableActiveOrder(tableId) {
    return allOrders.find(
      (o) => o.tableId === tableId && !['COMPLETED', 'CANCELLED'].includes(o.status),
    )
  }

  async function handleServeOrder(orderId) {
    setServingOrderId(orderId)
    setErrorMsg('')
    try {
      await orderService.updateOrderStatus(orderId, 'SERVED')
      await orders?.refetch?.()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update order status.')
    } finally {
      setServingOrderId(null)
    }
  }

  function handleStartOrderForTable(tableId) {
    setTakeOrderTableId(tableId)
    setIsTakeOrderOpen(true)
  }

  const isLoading = orders?.isLoading || reservations?.isLoading || tables?.isLoading

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-body">Dining Floor Dashboard</h1>
            <span className="rounded-full bg-brand-100 dark:bg-brand-950/60 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20">
              Waiter Station
            </span>
          </div>
          <p className="text-sm text-body-muted">
            Live dining floor operations — track active tables, incoming orders, kitchen passes, and guest arrivals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTakeOrderTableId(null)
            setIsTakeOrderOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Take New Order
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      {/* URGENT KITCHEN PASS ALERT BANNER */}
      {readyOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-brand-500/5 to-emerald-500/10 p-5 shadow-lg shadow-emerald-500/10 dark:border-emerald-500/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse">
                <BellRing className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-body">
                    {readyOrders.length} {readyOrders.length === 1 ? 'Order' : 'Orders'} Ready at Kitchen Pass!
                  </h3>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase tracking-wider">
                    Immediate Action
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-body-muted">
                  Plated dishes are waiting on the counter. Deliver promptly to customer tables.
                </p>
              </div>
            </div>

            <Link
              to={`${ROUTES.WAITER_ORDERS}?tab=ready`}
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View Ready Orders ({readyOrders.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick cards for ready orders */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {readyOrders.slice(0, 3).map((order) => {
              const itemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0
              return (
                <div
                  key={order.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-500/30 bg-card p-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="flex items-center gap-1.5 font-display text-sm font-bold text-body">
                        {order.table?.number ? (
                          <>
                            <Armchair className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                            Table {order.table.number}
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            Takeaway #{orderNo(order.id)}
                          </>
                        )}
                      </span>
                      <span className="text-[0.7rem] text-body-faint">
                        Order #{orderNo(order.id)} · {itemsCount} items
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 dark:text-emerald-300">
                      READY
                    </span>
                  </div>

                  <p className="line-clamp-1 text-xs text-body-muted">
                    {order.items?.map((it) => `${it.quantity}x ${it.menuItem?.name || 'Item'}`).join(', ')}
                  </p>

                  <button
                    type="button"
                    disabled={servingOrderId === order.id}
                    onClick={() => handleServeOrder(order.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {servingOrderId === order.id ? 'Serving...' : 'Mark as Served'}
                  </button>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 6 WAITER KPI CARDS */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            icon={CheckCircle2}
            label="Ready to Serve"
            value={stats.ready}
            to={`${ROUTES.WAITER_ORDERS}?tab=ready`}
            subtext="Plated at the pass"
            tone={stats.ready > 0 ? 'emerald' : 'brand'}
            highlight={stats.ready > 0}
          />
          <KpiCard
            icon={ChefHat}
            label="In Kitchen"
            value={stats.preparing}
            to={`${ROUTES.WAITER_ORDERS}?tab=preparing`}
            subtext="Being cooked"
            tone="brand"
          />
          <KpiCard
            icon={UtensilsCrossed}
            label="New Orders"
            value={stats.pending}
            to={`${ROUTES.WAITER_ORDERS}?tab=new`}
            subtext="Awaiting accept"
            tone={stats.pending > 0 ? 'amber' : 'brand'}
          />
          <KpiCard
            icon={CalendarClock}
            label="Today's Bookings"
            value={stats.todayReservations}
            to={`${ROUTES.WAITER_RESERVATIONS}?tab=today`}
            subtext="Scheduled today"
            tone="purple"
          />
          <KpiCard
            icon={Armchair}
            label="Available Tables"
            value={stats.availableTables}
            to={`${ROUTES.WAITER_TABLES}?filter=AVAILABLE`}
            subtext="Ready for guests"
            tone="emerald"
          />
          <KpiCard
            icon={Users}
            label="Occupied Tables"
            value={stats.occupiedTables}
            to={`${ROUTES.WAITER_TABLES}?filter=OCCUPIED`}
            subtext="Currently dining"
            tone="red"
          />
        </motion.div>
      )}

      {/* TWO-COLUMN OPERATIONAL GRID: LIVE FLOOR GLANCE & TODAY'S RESERVATIONS */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: LIVE FLOOR TABLES GLANCE (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SectionTitle>Dining Floor Glance</SectionTitle>
              <span className="text-xs text-body-muted">({sortedTables.length} tables)</span>
            </div>
            <Link
              to={ROUTES.WAITER_TABLES}
              className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              Open Floor Plan &rarr;
            </Link>
          </div>

          <Card className="p-4 flex flex-col gap-4">
            {sortedTables.length === 0 ? (
              <p className="text-center text-xs text-body-faint py-6">No tables configured.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedTables.slice(0, 9).map((table) => {
                  const activeOrder = getTableActiveOrder(table.id)
                  const isAvailable = table.status === 'AVAILABLE'
                  const isOccupied = table.status === 'OCCUPIED'

                  return (
                    <div
                      key={table.id}
                      className={`flex flex-col justify-between rounded-xl border p-3 transition ${
                        isOccupied
                          ? 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20'
                          : isAvailable
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-gold-300 bg-gold-50/40 dark:border-gold-800/40 dark:bg-gold-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-display text-sm font-bold text-body">
                            Table {table.number}
                          </span>
                          <span className="block text-[0.7rem] text-body-muted">
                            Seats {table.capacity}
                          </span>
                        </div>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOccupied ? 'bg-red-500' : isAvailable ? 'bg-emerald-500' : 'bg-gold-500'
                          }`}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-rule/50">
                        {activeOrder ? (
                          <div className="min-w-0">
                            <span className="block truncate text-[0.7rem] font-bold text-body">
                              {money(orderGrandTotal(activeOrder))}
                            </span>
                            <span className="block text-[0.65rem] text-body-faint">
                              {activeOrder.status}
                            </span>
                          </div>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleStartOrderForTable(table.id)}
                            className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                          >
                            <Plus className="h-3 w-3" />
                            Take Order
                          </button>
                        ) : (
                          <span className="text-[0.65rem] text-body-faint">Reserved</span>
                        )}

                        <span
                          className={`text-[0.65rem] font-semibold uppercase ${
                            isOccupied
                              ? 'text-red-700 dark:text-red-400'
                              : isAvailable
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-gold-700 dark:text-gold-400'
                          }`}
                        >
                          {table.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: TODAY'S GUEST RESERVATIONS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SectionTitle>Today&rsquo;s Reservations</SectionTitle>
              <span className="text-xs text-body-muted">({todayReservationsList.length})</span>
            </div>
            <Link
              to={ROUTES.WAITER_RESERVATIONS}
              className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              All Bookings &rarr;
            </Link>
          </div>

          <Card className="p-4 flex flex-col gap-3">
            {todayReservationsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-body-muted">
                <CalendarClock className="h-8 w-8 text-body-faint stroke-[1.5]" />
                <p className="mt-2 text-xs font-medium">No bookings scheduled for today.</p>
                <p className="text-[0.7rem] text-body-faint">Walk-in guests can be seated at any available table.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-rule">
                {todayReservationsList.map((res) => {
                  const occasion = res.occasion
                    ? res.occasion === 'OTHER'
                      ? res.occasionNote?.trim() || 'Other'
                      : OCCASION_LABELS[res.occasion]
                    : null

                  return (
                    <div key={res.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-display text-xs font-bold text-body">
                            {res.customerName}
                          </span>
                          <span className="block text-[0.7rem] text-body-muted">
                            {res.guestCount} {res.guestCount === 1 ? 'guest' : 'guests'} · Table {res.table?.number}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="rounded-lg bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 text-[0.7rem] font-bold text-purple-800 dark:text-purple-300">
                            {formatTime(res.reservationTime)}
                          </span>
                          <ReservationStatusBadge status={res.status} />
                        </div>
                      </div>

                      {occasion && (
                        <div className="flex items-center gap-1.5 text-[0.7rem] text-gold-600 dark:text-gold-400 font-medium">
                          <Sparkles className="h-3 w-3 flex-none" />
                          <span>{occasion}</span>
                        </div>
                      )}

                      {res.specialRequest && (
                        <p className="rounded-lg bg-canvas-2 px-2.5 py-1.5 text-[0.7rem] leading-relaxed text-body-muted">
                          <strong className="text-body font-semibold">Note: </strong>
                          {res.specialRequest}
                        </p>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartOrderForTable(res.tableId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400"
                        >
                          <UtensilsCrossed className="h-3 w-3" />
                          Seat & Take Order
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Take Order Modal */}
      <TakeOrderModal
        isOpen={isTakeOrderOpen}
        onClose={() => {
          setIsTakeOrderOpen(false)
          setTakeOrderTableId(null)
        }}
        tables={allTables}
        preselectedTableId={takeOrderTableId}
        onOrderCreated={() => {
          orders?.refetch?.()
          tables?.refetch?.()
        }}
      />
    </div>
  )
}
