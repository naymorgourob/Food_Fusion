import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Eye,
  Printer,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react'
import { Card, SectionTitle, SkeletonCard, EmptyState, Rise } from '@/components/customer/ui'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { CustomerBillDrawer } from '@/features/billing/components/CustomerBillDrawer'
import { CustomerReceiptModal } from '@/features/billing/components/CustomerReceiptModal'
import { useBills } from '@/features/billing/hooks/useBills'
import { money, orderNo } from '@/utils/format'
import { ROUTES } from '@/constants'

export default function MyBillsPage() {
  const { bills = [], isLoading, error, refetch } = useBills()

  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'PAID' | 'UNPAID'
  const [selectedBill, setSelectedBill] = useState(null)
  const [receiptBill, setReceiptBill] = useState(null)

  // Derive summary metrics from real backend bills
  const summary = useMemo(() => {
    let totalSpent = 0
    let paidCount = 0
    let unpaidCount = 0

    for (const bill of bills) {
      if (bill.paymentStatus === 'PAID') {
        totalSpent += Number(bill.grandTotal || 0)
        paidCount++
      } else {
        unpaidCount++
      }
    }

    return { totalSpent, paidCount, unpaidCount }
  }, [bills])

  // Filter bills by status
  const filteredBills = useMemo(() => {
    if (statusFilter === 'ALL') return bills
    return bills.filter((b) => b.paymentStatus === statusFilter)
  }, [bills, statusFilter])

  function handleOpenReceipt(bill) {
    setSelectedBill(null)
    setReceiptBill(bill)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-body">
            Payment History
          </h1>
          <p className="text-sm text-body-muted">
            Your payments and receipts.
          </p>
        </div>

        <Link
          to={ROUTES.ORDERS}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition hover:underline"
        >
          View My Orders
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* --- Error State --- */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200/80 bg-red-50/60 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 flex-none" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg bg-red-100 dark:bg-red-900/50 px-3 py-1 font-semibold hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* --- Loading State --- */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
          <SkeletonCard lines={4} />
        </div>
      ) : bills.length === 0 ? (
        /* --- Empty State --- */
        <EmptyState
          icon={Receipt}
          title="Your payment history is empty."
          description="You have no bills or payment records yet. Completed dining orders with generated invoices will appear here."
          actionLabel="View My Orders"
          to={ROUTES.ORDERS}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* --- Summary Cards (Clean & Derived from Real Backend Data) --- */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            <Card className="flex flex-col justify-between gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/20">
                  <CreditCard className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-body-faint">
                  Settled
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-2xl font-bold text-body">
                  {money(summary.totalSpent)}
                </span>
                <span className="truncate text-xs font-semibold text-body-muted">
                  Total Spent
                </span>
              </div>
            </Card>

            <Card className="flex flex-col justify-between gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Completed
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-2xl font-bold text-body">
                  {summary.paidCount}
                </span>
                <span className="truncate text-xs font-semibold text-body-muted">
                  Successful Payments
                </span>
              </div>
            </Card>

            <Card className="flex flex-col justify-between gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20">
                  <Clock className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Awaiting
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-2xl font-bold text-body">
                  {summary.unpaidCount}
                </span>
                <span className="truncate text-xs font-semibold text-body-muted">
                  Pending Payments
                </span>
              </div>
            </Card>
          </div>

          {/* --- Simple Filter Tabs (All | Paid | Pending) --- */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-rule bg-card p-1">
              {[
                { id: 'ALL', label: 'All', count: bills.length },
                { id: 'PAID', label: 'Paid', count: summary.paidCount },
                { id: 'UNPAID', label: 'Pending', count: summary.unpaidCount },
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
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                      statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-canvas-2 text-body-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-xs text-body-faint hidden sm:inline">
              Showing {filteredBills.length} of {bills.length} payments
            </span>
          </div>

          {/* --- Payments List / Table --- */}
          {filteredBills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rule p-8 text-center text-xs text-body-muted">
              No payments match the selected filter.
            </div>
          ) : (
            <div className="flex flex-col">
              {/* DESKTOP / TABLET TABLE VIEW */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-rule bg-card shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rule bg-canvas-2/50 text-body-faint font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule text-body">
                    {filteredBills.map((bill) => {
                      const order = bill.order
                      const methodLabel =
                        order?.orderType === 'DINE_IN'
                          ? 'In-Restaurant'
                          : order?.orderType === 'DELIVERY'
                          ? 'Online payment on delivery'
                          : 'Counter Collection'

                      return (
                        <tr
                          key={bill.id}
                          className="hover:bg-canvas-2/40 transition group cursor-pointer"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-body">
                                #{orderNo(order?.orderNumber)}
                              </span>
                              <OrderTypeBadge orderType={order?.orderType} />
                            </div>
                            <span className="text-[0.65rem] text-body-faint block mt-0.5">
                              Bill #{orderNo(bill.billNumber)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-body-muted">
                            <span className="block font-medium text-body">
                              {new Date(bill.billDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[0.65rem] text-body-faint">
                              {new Date(bill.billDate).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-body-muted">
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-body-faint" />
                              {methodLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-display text-sm font-bold text-body">
                              {money(bill.grandTotal)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <PaymentStatusBadge status={bill.paymentStatus} />
                          </td>

                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedBill(bill)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rule bg-card px-2.5 py-1 text-xs font-semibold text-body hover:bg-canvas-2 transition"
                                title="View Bill Details"
                              >
                                <Eye className="h-3 w-3 text-body-muted" />
                                Details
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(bill)}
                                className="inline-flex items-center gap-1 rounded-lg bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body hover:bg-canvas-2/80 transition"
                                title="View Receipt"
                              >
                                <Receipt className="h-3 w-3 text-body-muted" />
                                Receipt
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="flex flex-col gap-3 sm:hidden">
                {filteredBills.map((bill) => {
                  const order = bill.order
                  const methodLabel =
                    order?.orderType === 'DINE_IN'
                      ? 'In-Restaurant'
                      : order?.orderType === 'DELIVERY'
                      ? 'Online payment on delivery'
                      : 'Counter Collection'

                  return (
                    <div
                      key={bill.id}
                      onClick={() => setSelectedBill(bill)}
                      className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4 shadow-xs hover:bg-canvas-2/40 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-body">
                              Order #{orderNo(order?.orderNumber)}
                            </span>
                            <OrderTypeBadge orderType={order?.orderType} />
                          </div>
                          <span className="text-[0.7rem] text-body-faint">
                            Bill #{orderNo(bill.billNumber)} ·{' '}
                            {new Date(bill.billDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <PaymentStatusBadge status={bill.paymentStatus} />
                      </div>

                      <div className="flex items-center justify-between border-t border-rule/50 pt-2 text-xs">
                        <span className="text-body-muted flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-body-faint" />
                          {methodLabel}
                        </span>
                        <span className="font-display text-base font-bold text-body">
                          {money(bill.grandTotal)}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-end gap-2 pt-2 border-t border-rule/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedBill(bill)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body"
                        >
                          <Eye className="h-3 w-3 text-body-muted" />
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(bill)}
                          className="inline-flex items-center gap-1 rounded-lg bg-canvas-2 px-3 py-1.5 text-xs font-semibold text-body"
                        >
                          <Receipt className="h-3 w-3 text-body-muted" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Bill Details Drawer --- */}
      <CustomerBillDrawer
        isOpen={Boolean(selectedBill)}
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
        onViewReceipt={handleOpenReceipt}
      />

      {/* --- Receipt Modal --- */}
      <CustomerReceiptModal
        isOpen={Boolean(receiptBill)}
        bill={receiptBill}
        onClose={() => setReceiptBill(null)}
      />
    </div>
  )
}
