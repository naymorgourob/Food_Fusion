import { useState, useMemo } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  Users,
  Sparkles,
  Armchair,
  Phone,
  Mail,
  Search,
  Plus,
  UtensilsCrossed,
  Clock,
  Info,
} from 'lucide-react'
import { StatusBadge } from '@/features/reservations/components/StatusBadge'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'
import { TakeOrderModal } from '@/features/orders/components/TakeOrderModal'
import { ROUTES } from '@/constants'
import { orderNo } from '@/utils/format'

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

function isWithinNext7Days(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const future = new Date(today)
  future.setDate(future.getDate() + 7)
  return d >= today && d <= future
}

function formatTime(value) {
  if (!value) return ''
  const [hours, minutes] = String(value).split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function WaiterReservationsPage() {
  const { reservations, tables, orders } = useOutletContext()

  const [filterTab, setFilterTab] = useState('TODAY')
  const [searchQuery, setSearchQuery] = useState('')
  const [takeOrderTableId, setTakeOrderTableId] = useState(null)
  const [takeOrderGuestName, setTakeOrderGuestName] = useState('')
  const [isTakeOrderOpen, setIsTakeOrderOpen] = useState(false)

  const allReservations = reservations?.reservations || []
  const allTables = tables?.tables || []

  // Counts for tabs
  const counts = useMemo(() => {
    let today = 0
    let upcoming = 0
    let active = 0

    for (const res of allReservations) {
      if (res.status === 'CANCELLED') continue
      active++
      if (isToday(res.reservationDate)) today++
      if (isWithinNext7Days(res.reservationDate)) upcoming++
    }

    return { today, upcoming, active }
  }, [allReservations])

  // Filtered reservations list
  const filteredReservations = useMemo(() => {
    return allReservations
      .filter((res) => {
        if (res.status === 'CANCELLED' && filterTab !== 'ALL') return false

        if (filterTab === 'TODAY' && !isToday(res.reservationDate)) return false
        if (filterTab === 'UPCOMING' && !isWithinNext7Days(res.reservationDate)) return false

        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = res.customerName?.toLowerCase().includes(q)
          const phoneMatch = res.customerPhone?.toLowerCase().includes(q)
          const tableMatch = String(res.table?.number || '').includes(q)
          const idMatch = res.id?.toLowerCase().includes(q)
          if (!nameMatch && !phoneMatch && !tableMatch && !idMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.reservationDate.split('T')[0]}T${a.reservationTime || '00:00'}`)
        const dateB = new Date(`${b.reservationDate.split('T')[0]}T${b.reservationTime || '00:00'}`)
        return dateA - dateB
      })
  }, [allReservations, filterTab, searchQuery])

  function handleSeatGuest(reservation) {
    setTakeOrderTableId(reservation.tableId)
    setTakeOrderGuestName(reservation.customerName)
    setIsTakeOrderOpen(true)
  }

  // Get live table object by tableId
  function getTableInfo(tableId) {
    return allTables.find((t) => t.id === tableId)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold text-body">Dining Floor Reservations</h1>
            <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20">
              {counts.today} Today
            </span>
          </div>
          <p className="text-sm text-body-muted">
            Reception & floor arrivals — view upcoming bookings, check party sizes, note guest requests, and seat diners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={ROUTES.WAITER_TABLES}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rule bg-card px-3.5 py-2.5 text-xs font-semibold text-body shadow-xs transition hover:bg-canvas-2"
          >
            <Armchair className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            View Floor Tables
          </Link>

          <button
            type="button"
            onClick={() => {
              setTakeOrderTableId(null)
              setTakeOrderGuestName('')
              setIsTakeOrderOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Take Order
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-rule bg-card p-1">
          {[
            { id: 'TODAY', label: "Today's Bookings", count: counts.today },
            { id: 'UPCOMING', label: 'Next 7 Days', count: counts.upcoming },
            { id: 'ALL', label: 'All Active', count: counts.active },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filterTab === tab.id
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-body-muted hover:bg-canvas-2 hover:text-body'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                  filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-canvas-2 text-body-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest, phone, table #..."
            className="w-full rounded-xl border border-rule bg-card py-1.5 pl-9 pr-3 text-xs text-body placeholder:text-body-faint focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Notice info */}
      <p className="flex items-center gap-2 rounded-xl border border-rule bg-card px-4 py-2.5 text-xs text-body-muted shadow-xs">
        <Info className="h-4 w-4 flex-none text-brand-600 dark:text-brand-400" />
        Reservation confirmation is managed by the front desk. When guests arrive, tap &ldquo;Seat & Take Order&rdquo; to open their table order ticket.
      </p>

      {/* Reservations Cards List */}
      {reservations.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={
            filterTab === 'TODAY'
              ? 'No reservations for today'
              : 'No reservations found'
          }
          description={
            searchQuery
              ? 'Try changing your search query or filters.'
              : 'Guest reservations will appear here as they are scheduled.'
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReservations.map((res) => {
            const occasion = res.occasion
              ? res.occasion === 'OTHER'
                ? res.occasionNote?.trim() || 'Other'
                : OCCASION_LABELS[res.occasion]
              : null

            const isResToday = isToday(res.reservationDate)
            const liveTable = getTableInfo(res.tableId)

            return (
              <motion.div
                key={res.id}
                layout
                className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all duration-200 bg-card ${
                  isResToday ? 'border-purple-200/80 dark:border-purple-900/50' : 'border-rule'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Header: Guest Name, ID & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-display text-base font-bold text-body">
                        {res.customerName}
                      </span>
                      <span className="block text-[0.7rem] text-body-faint">
                        Ref #{orderNo(res.id.slice(-6).toUpperCase())}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={res.status} />
                      {isResToday && (
                        <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2 py-0.2 text-[0.65rem] font-bold text-purple-700 dark:text-purple-300">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timing & Party Details */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-canvas-2 p-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-semibold text-body-faint uppercase">
                        Date & Time
                      </span>
                      <span className="font-semibold text-body flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-none" />
                        {formatTime(res.reservationTime)}
                      </span>
                      <span className="text-[0.7rem] text-body-muted">
                        {new Date(res.reservationDate).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-semibold text-body-faint uppercase">
                        Party & Table
                      </span>
                      <span className="font-semibold text-body flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-none" />
                        {res.guestCount} {res.guestCount === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <span className="text-[0.7rem] text-body-muted flex items-center gap-1">
                        <Armchair className="h-3 w-3 flex-none" />
                        Table {res.table?.number}
                        {liveTable && (
                          <span
                            className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${
                              liveTable.status === 'AVAILABLE'
                                ? 'bg-emerald-500'
                                : liveTable.status === 'OCCUPIED'
                                ? 'bg-red-500'
                                : 'bg-gold-500'
                            }`}
                            title={`Table is currently ${liveTable.status}`}
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info (if available) */}
                  {(res.customerPhone || res.customerEmail) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-body-muted">
                      {res.customerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-body-faint" />
                          {res.customerPhone}
                        </span>
                      )}
                      {res.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-body-faint" />
                          {res.customerEmail}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Occasion */}
                  {occasion && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-gold-600 dark:text-gold-400 font-medium">
                      <Sparkles className="h-3.5 w-3.5 flex-none" />
                      <span>{occasion}</span>
                    </div>
                  )}

                  {/* Special Requests */}
                  {res.specialRequest && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <strong className="block text-[0.65rem] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Special Request / Allergy Note
                      </strong>
                      <p className="mt-0.5 text-xs leading-relaxed">{res.specialRequest}</p>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between gap-2">
                  <Link
                    to={`${ROUTES.WAITER_TABLES}?q=${res.table?.number}`}
                    className="inline-flex items-center gap-1 text-xs text-body-muted hover:text-body transition"
                  >
                    <Armchair className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                    Table {res.table?.number}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSeatGuest(res)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-800 active:scale-[0.98]"
                  >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Seat & Take Order
                  </button>
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
          setTakeOrderTableId(null)
          setTakeOrderGuestName('')
        }}
        tables={allTables}
        preselectedTableId={takeOrderTableId}
        initialGuestName={takeOrderGuestName}
        onOrderCreated={() => {
          orders?.refetch?.()
          tables?.refetch?.()
        }}
      />
    </div>
  )
}
