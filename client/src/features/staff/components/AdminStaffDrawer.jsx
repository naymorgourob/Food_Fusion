import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Shield,
  Clock,
  ShoppingBag,
  Pencil,
  UserCheck,
  UserX,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { StaffStatusBadge } from '@/features/staff/components/StaffStatusBadge'
import { StaffPositionBadge } from '@/features/staff/components/StaffPositionBadge'
import { fetchStaffById } from '@/features/staff/services/staffService'
import { getImageUrl } from '@/constants'
import { money, orderNo } from '@/utils/format'

export function AdminStaffDrawer({
  member,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  isToggling,
}) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

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
    if (!member?.id || !isOpen) {
      setDetails(null)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchStaffById(member.id)
      .then((data) => {
        if (!cancelled) setDetails(data)
      })
      .catch(() => {
        if (!cancelled) setDetails(member)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [member?.id, isOpen])

  if (!member) return null

  const displayData = details || member
  const avatarUrl = getImageUrl(displayData.profileImage)
  const initials = displayData.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const assignedOrders = displayData.assignedOrders ?? []

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close staff details"
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
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-gold-600 to-gold-800 text-base font-bold text-white shadow-sm">
                    {initials}
                  </span>
                )}
                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate font-display text-lg font-bold text-body">
                    {displayData.fullName}
                  </h2>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <StaffPositionBadge position={displayData.position} />
                    <StaffStatusBadge isActive={displayData.isActive} />
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

                {/* --- Employment Details --------------------------------- */}
                <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-body-faint">
                    Staff & Employment Details
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1 rounded-xl bg-canvas p-3">
                      <span className="flex items-center gap-1 text-body-muted">
                        <Briefcase className="h-3.5 w-3.5 text-body-faint" />
                        Job Position
                      </span>
                      <span className="font-semibold text-body">
                        {displayData.position || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-canvas p-3">
                      <span className="flex items-center gap-1 text-body-muted">
                        <Shield className="h-3.5 w-3.5 text-body-faint" />
                        System Role
                      </span>
                      <span className="font-semibold text-body">
                        {displayData.role || 'STAFF'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-canvas p-3">
                      <span className="flex items-center gap-1 text-body-muted">
                        <Calendar className="h-3.5 w-3.5 text-body-faint" />
                        Joined Date
                      </span>
                      <span className="font-semibold text-body">
                        {new Date(displayData.createdAt).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-canvas p-3">
                      <span className="flex items-center gap-1 text-body-muted">
                        <Clock className="h-3.5 w-3.5 text-body-faint" />
                        Last Profile Update
                      </span>
                      <span className="font-semibold text-body">
                        {displayData.updatedAt
                          ? new Date(displayData.updatedAt).toLocaleDateString([], {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- Assigned Orders Section ---------------------------- */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-body-faint">
                      <ShoppingBag className="h-4 w-4" />
                      Assigned Orders ({displayData._count?.assignedOrders ?? assignedOrders.length})
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col gap-2.5 py-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-14 rounded-xl" />
                      ))}
                    </div>
                  ) : assignedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule py-8 text-center">
                      <ShoppingBag className="h-6 w-6 text-body-faint" />
                      <p className="text-xs font-medium text-body-muted">
                        No orders assigned to this staff member yet
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {assignedOrders.map((order) => (
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
                  )}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <footer className="flex flex-none items-center justify-between gap-3 border-t border-rule bg-canvas/60 p-4 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEdit(displayData)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-rule bg-card px-4 py-2.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => onToggleStatus(displayData)}
                disabled={isToggling}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                  displayData.isActive
                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {displayData.isActive ? (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
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

