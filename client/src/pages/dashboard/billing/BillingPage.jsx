import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Plus,
  Search,
  SlidersHorizontal,
  SearchX,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'
import { BillingStatsSummary } from '@/features/billing/components/BillingStatsSummary'
import { AdminBillRow } from '@/features/billing/components/AdminBillRow'
import { AdminBillDrawer } from '@/features/billing/components/AdminBillDrawer'
import { GenerateBillModal } from '@/features/billing/components/GenerateBillModal'
import { useBills } from '@/features/billing/hooks/useBills'
import * as billService from '@/features/billing/services/billService'
import { fetchOrders } from '@/features/orders/services/orderService'
import {
  PAYMENT_STATUS_OPTIONS,
  SORT_OPTIONS,
  filterBills,
  sortBills,
} from '@/features/billing/billingHelpers'
import { orderNo } from '@/utils/format'

/**
 * Admin / Staff Billing & Invoicing Management (UI-08 redesign).
 *
 * Full integration with existing `/billing` backend APIs:
 * - Real PostgreSQL invoices loaded via `useBills`
 * - Live financial metrics summary bar with clickable filter shortcuts
 * - Instant search by Bill #, Order #, Customer Name, Email, or Phone
 * - Status filtering (All, Paid, Unpaid) & multi-criterion sorting
 * - Redesigned Bill Generation modal with order selector & live calculation preview
 * - Side invoice drawer with itemized line items, print, copy, & payment toggle
 * - Instant payment status toggling directly from rows or drawer
 */
export default function BillingPage() {
  const { bills, isLoading, error, refetch } = useBills()

  // Completed orders for bill generation
  const [completedOrders, setCompletedOrders] = useState([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)

  // Filter & sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Modals and Drawer state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [generateModalKey, setGenerateModalKey] = useState(0)
  const [viewingBill, setViewingBill] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Load completed orders whenever bills list changes
  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsOrdersLoading(true)
      try {
        const orders = await fetchOrders()
        if (!cancelled) {
          setCompletedOrders(orders.filter((order) => order.status === 'COMPLETED'))
        }
      } catch {
        if (!cancelled) setCompletedOrders([])
      } finally {
        if (!cancelled) setIsOrdersLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [bills])

  // Filter out orders that already have a bill
  const billedOrderIds = useMemo(() => {
    return new Set(bills.map((b) => b.order?.id).filter(Boolean))
  }, [bills])

  const eligibleOrders = useMemo(() => {
    return completedOrders.filter((order) => !billedOrderIds.has(order.id))
  }, [completedOrders, billedOrderIds])

  // Filter and sort bills
  const filtered = useMemo(() => {
    return filterBills(bills, { search: searchTerm, status: statusFilter })
  }, [bills, searchTerm, statusFilter])

  const sorted = useMemo(() => {
    return sortBills(filtered, sortBy)
  }, [filtered, sortBy])

  const activeFilterCount = (statusFilter ? 1 : 0) + (sortBy !== 'date-desc' ? 1 : 0)
  const isFiltered = Boolean(searchTerm) || activeFilterCount > 0

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
    setSortBy('date-desc')
  }

  function handleStatFilter(status) {
    setStatusFilter((curr) => (curr === status ? '' : status))
  }

  // Toggle payment status handler (used by row and drawer)
  async function handleToggleStatus(bill) {
    if (!bill || isUpdatingStatus) return
    const newStatus = bill.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID'
    setIsUpdatingStatus(true)
    try {
      const updated = await billService.updatePaymentStatus(bill.id, newStatus)
      if (viewingBill && viewingBill.id === bill.id) {
        setViewingBill(updated)
      }
      setFeedbackMessage({
        type: 'success',
        text: `Invoice ${orderNo(bill.billNumber)} marked as ${newStatus === 'PAID' ? 'Settled (Paid)' : 'Pending (Unpaid)'}.`,
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      refetch()
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message ?? 'Failed to update payment status.',
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle drawer status change directly
  async function handleDrawerStatusChange(targetStatus) {
    if (!viewingBill || isUpdatingStatus) return
    setIsUpdatingStatus(true)
    try {
      const updated = await billService.updatePaymentStatus(viewingBill.id, targetStatus)
      setViewingBill(updated)
      setFeedbackMessage({
        type: 'success',
        text: `Invoice ${orderNo(viewingBill.billNumber)} status updated to ${targetStatus === 'PAID' ? 'Paid' : 'Unpaid'}.`,
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      refetch()
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.message ?? 'Failed to update payment status.',
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  function handleGenerated(bill) {
    setIsGenerateOpen(false)
    setFeedbackMessage({
      type: 'success',
      text: `Invoice ${orderNo(bill.billNumber)} generated successfully!`,
    })
    setTimeout(() => setFeedbackMessage(null), 4000)
    refetch()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-body">Billing & Invoicing</h1>
            <span className="flex h-6 items-center justify-center rounded-full bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {bills.length} invoices
            </span>
            {eligibleOrders.length > 0 && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                {eligibleOrders.length} ready to bill
              </span>
            )}
          </div>
          <p className="text-sm text-body-muted">
            Issue guest invoices, monitor settled payments, and track outstanding receivables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh billing data"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rule bg-card text-body-muted hover:text-body hover:bg-canvas-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setGenerateModalKey((k) => k + 1)
              setIsGenerateOpen(true)
            }}
            className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gold-400"
          >
            <Receipt className="h-4 w-4" />
            Generate Bill
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ──────────────────────────────────── */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              feedbackMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-none text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 flex-none text-rose-600 dark:text-rose-400" />
          <span>Failed to load bills: {error.message || 'Unknown error occurred.'}</span>
        </div>
      )}

      {/* ── Metrics Summary Bar ────────────────────────────────────── */}
      <BillingStatsSummary
        bills={bills}
        selectedFilter={statusFilter}
        onSelectFilter={handleStatFilter}
      />

      {/* ── Search & Filter Controls ───────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice #, Order #, Guest name, email, or phone…"
            aria-label="Search invoices"
            className="w-full rounded-full border border-rule bg-card py-2.5 pr-4 pl-10 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900"
          />
        </div>

        {/* Quick status tabs & filter toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status buttons */}
          <div className="inline-flex rounded-full border border-rule bg-card p-1 shadow-xs">
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-body-muted hover:text-body'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Toggle sort options */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${
              filtersOpen || sortBy !== 'date-desc'
                ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                : 'border-rule bg-card text-body hover:bg-canvas-2'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Sort
            {sortBy !== 'date-desc' && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Sort Tray Drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-rule bg-card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-body tracking-tight">Sort Invoices by</span>
                <div className="flex flex-wrap items-center gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        sortBy === opt.value
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-300'
                          : 'border-rule bg-canvas text-body-muted hover:text-body hover:bg-canvas-2'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Invoices List / Skeleton / Empty State ─────────────────── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-rule bg-card p-4 shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="skeleton h-11 w-11 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <div className="skeleton h-4 w-36 rounded" />
                  <div className="skeleton h-3 w-52 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="skeleton h-5 w-24 rounded hidden sm:block" />
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        isFiltered ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-body-faint">
              <SearchX className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-body">No invoices found</h3>
              <p className="max-w-sm text-xs text-body-muted">
                No invoices match your active query or filter criteria. Try clearing filters or searching with a different term.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 rounded-full border border-rule bg-card px-4 py-2 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-body-faint">
              <ReceiptText className="h-6 w-6 text-brand-500" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-body">No bills generated yet</h3>
              <p className="max-w-sm text-xs text-body-muted">
                {eligibleOrders.length > 0
                  ? `There are ${eligibleOrders.length} completed orders ready to be billed.`
                  : 'Orders must reach Completed status before an invoice can be generated.'}
              </p>
            </div>
            {eligibleOrders.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setGenerateModalKey((k) => k + 1)
                  setIsGenerateOpen(true)
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-xs font-bold text-charcoal hover:bg-gold-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Generate First Bill
              </button>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          {/* Result counter */}
          <div className="flex items-center justify-between text-xs text-body-muted px-1">
            <span>
              Showing <strong className="text-body font-semibold">{sorted.length}</strong> of{' '}
              <strong className="text-body font-semibold">{bills.length}</strong> invoices
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-brand-700 hover:underline dark:text-brand-400"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Invoice Cards */}
          <AnimatePresence initial={false}>
            {sorted.map((bill) => (
              <AdminBillRow
                key={bill.id}
                bill={bill}
                onView={(b) => setViewingBill(b)}
                onToggleStatus={handleToggleStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Generate Bill Modal ────────────────────────────────────── */}
      <GenerateBillModal
        key={generateModalKey}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        eligibleOrders={eligibleOrders}
        onGenerated={handleGenerated}
      />

      {/* ── Invoice Detail Drawer ──────────────────────────────────── */}
      <AdminBillDrawer
        isOpen={Boolean(viewingBill)}
        onClose={() => setViewingBill(null)}
        bill={viewingBill}
        onStatusChange={handleDrawerStatusChange}
        isUpdatingStatus={isUpdatingStatus}
      />
    </div>
  )
}
