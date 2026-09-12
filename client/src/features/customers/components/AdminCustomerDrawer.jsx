import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  CalendarCheck,
  Heart,
  Sparkles,
  UserCheck,
  UserX,
  Copy,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { CustomerStatusBadge } from '@/features/customers/components/CustomerStatusBadge'
import { fetchCustomerById } from '@/features/customers/services/customerService'
import { getImageUrl } from '@/constants'
import { money, orderNo } from '@/utils/format'

export function AdminCustomerDrawer({ customer, isOpen, onClose, onToggleStatus, isToggling }) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'reservations' | 'loyalty'

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

  useEffect(() => {
    if (!customer?.id || !isOpen) {
      setDetails(null)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchCustomerById(customer.id)
      .then((data) => {
        if (!cancelled) setDetails(data)
      })
      .catch(() => {
        if (!cancelled) setDetails(customer)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [customer?.id, isOpen])

  if (!customer) return null

  const displayData = details || customer
  const avatarUrl = getImageUrl(displayData.profileImage)
  const initials = displayData.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const ordersList = displayData.orders ?? []
  const reservationsList = displayData.reservations ?? []
  const loyaltyList = displayData.loyaltyTransactions ?? []

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const ORDER_STATUS_STYLES = {
    COMPLETED: 'bg-success-soft text-success',
    PENDING: 'bg-warning-soft text-warning',
    ACCEPTED: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    PREPARING: 'bg-gold-100 text-gold-700 dark:bg-gold-100/10 dark:text-gold-300',
    READY: 'bg-info-soft text-info',
    CANCELLED: 'bg-surface-2 text-ink-muted',
  }

  const RESERVATION_STATUS_STYLES = {
    CONFIRMED: 'bg-info-soft text-info',
    PENDING: 'bg-warning-soft text-warning',
    COMPLETED: 'bg-success-soft text-success',
    CANCELLED: 'bg-surface-2 text-ink-muted',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close customer details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${displayData.fullName} details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-canvas shadow-2xl"
          >
            {/* Header */}
            <header className="flex flex-none items-center justify-between border-b border-rule px-6 py-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-12 w-12 flex-none rounded-2xl object-cover ring-2 ring-rule"
                  />
                ) : (
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-base font-bold text-white shadow-sm">
                    {initials}
                  </span>
                )}
                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate font-display text-lg font-bold text-body">
                    {displayData.fullName}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <CustomerStatusBadge isActive={displayData.isActive} />
                    <span className="text-[11px] text-body-faint">
                      Joined {new Date(displayData.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-2 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-6">
                {/* --- Contact card --------------------------------------- */}
                <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                    Contact Information
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 text-body-muted truncate">
                        <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none" />
                        <span className="truncate">{displayData.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(displayData.email)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-body-faint hover:bg-canvas-2 hover:text-body"
                        title="Copy email"
                      >
                        {copiedEmail ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedEmail ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 text-body-muted truncate">
                        <Phone className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-none" />
                        <span>{displayData.phone}</span>
                      </div>
                      <a
                        href={`tel:${displayData.phone}`}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Call
                      </a>
                    </div>
                  </div>
                </div>

                {/* --- Activity stats ------------------------------------- */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 rounded-xl border border-rule bg-card p-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-[11px] font-semibold text-body-muted">
                      <ShoppingBag className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                      Orders
                    </span>
                    <span className="font-display text-xl font-bold text-body">
                      {displayData._count?.orders ?? ordersList.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-rule bg-card p-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-[11px] font-semibold text-body-muted">
                      <CalendarCheck className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
                      Bookings
                    </span>
                    <span className="font-display text-xl font-bold text-body">
                      {displayData._count?.reservations ?? reservationsList.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-rule bg-card p-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-[11px] font-semibold text-body-muted">
                      <Heart className="h-3.5 w-3.5 text-danger" />
                      Favorites
                    </span>
                    <span className="font-display text-xl font-bold text-body">
                      {displayData._count?.favorites ?? 0}
                    </span>
                  </div>
                </div>

                {/* --- Tabs for details ----------------------------------- */}
                <div className="flex flex-col gap-3">
                  <div className="flex border-b border-rule">
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'orders'
                          ? 'border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400'
                          : 'border-transparent text-body-muted hover:text-body'
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Recent Orders ({ordersList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reservations')}
                      className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'reservations'
                          ? 'border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400'
                          : 'border-transparent text-body-muted hover:text-body'
                      }`}
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      Reservations ({reservationsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('loyalty')}
                      className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'loyalty'
                          ? 'border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400'
                          : 'border-transparent text-body-muted hover:text-body'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Loyalty ({loyaltyList.length})
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col gap-2.5 py-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-14 rounded-xl" />
                      ))}
                    </div>
                  ) : activeTab === 'orders' ? (
                    ordersList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule py-8 text-center">
                        <ShoppingBag className="h-6 w-6 text-body-faint" />
                        <p className="text-xs font-medium text-body-muted">No orders yet</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {ordersList.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-xl border border-rule bg-card px-3.5 py-2.5 text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-body">
                                {orderNo(order.orderNumber)}
                              </span>
                              <span className="text-[11px] text-body-faint">
                                {order.orderType} · {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-semibold text-body">
                                {money(order.totalAmount)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  ORDER_STATUS_STYLES[order.status] ?? 'bg-surface-2 text-ink-muted'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : activeTab === 'reservations' ? (
                    reservationsList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule py-8 text-center">
                        <CalendarCheck className="h-6 w-6 text-body-faint" />
                        <p className="text-xs font-medium text-body-muted">No reservations yet</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {reservationsList.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between rounded-xl border border-rule bg-card px-3.5 py-2.5 text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-body">
                                {new Date(res.reservationDate).toLocaleDateString([], {
                                  day: 'numeric',
                                  month: 'short',
                                })}{' '}
                                at {res.reservationTime}
                              </span>
                              <span className="text-[11px] text-body-faint">
                                {res.table ? `Table ${res.table.number}` : 'No table assigned'} ·{' '}
                                {res.guestCount} guests
                              </span>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                RESERVATION_STATUS_STYLES[res.status] ?? 'bg-surface-2 text-ink-muted'
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    loyaltyList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule py-8 text-center">
                        <Sparkles className="h-6 w-6 text-body-faint" />
                        <p className="text-xs font-medium text-body-muted">No loyalty points history</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {loyaltyList.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between rounded-xl border border-rule bg-card px-3.5 py-2.5 text-xs"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-body">
                                {tx.reason || tx.type}
                              </span>
                              <span className="text-[11px] text-body-faint">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`font-bold ${
                                tx.type === 'REDEEMED' ? 'text-danger' : 'text-success'
                              }`}
                            >
                              {tx.type === 'REDEEMED' ? '-' : '+'}
                              {tx.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <footer className="flex flex-none items-center justify-between border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <span className="text-xs text-body-faint">
                Account is currently{' '}
                <strong className={displayData.isActive ? 'text-success' : 'text-danger'}>
                  {displayData.isActive ? 'Active' : 'Suspended'}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => onToggleStatus(displayData)}
                disabled={isToggling}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                  displayData.isActive
                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {displayData.isActive ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activate Account
                  </>
                )}
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
