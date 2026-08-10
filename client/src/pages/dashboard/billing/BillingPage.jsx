import { useEffect, useState } from 'react'
import { Eye, Receipt } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { BillDetailsModal } from '@/features/billing/components/BillDetailsModal'
import { GenerateBillModal } from '@/features/billing/components/GenerateBillModal'
import { useBills } from '@/features/billing/hooks/useBills'
import * as billService from '@/features/billing/services/billService'
import { fetchOrders } from '@/features/orders/services/orderService'

// Shared by Admin and Staff (both land here, see App.jsx) — the backend
// scopes GET /billing to "all" for both roles.
export default function BillingPage() {
  const { bills, isLoading, refetch } = useBills()

  const [completedOrders, setCompletedOrders] = useState([])
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  // Bumped every time the modal opens so React remounts it with a fresh
  // key — same reset-on-remount pattern as Category/Table/MenuItem forms,
  // instead of an effect that resets state after the fact.
  const [generateModalKey, setGenerateModalKey] = useState(0)

  const [viewingBill, setViewingBill] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const orders = await fetchOrders()
        if (!cancelled) setCompletedOrders(orders.filter((order) => order.status === 'COMPLETED'))
      } catch {
        if (!cancelled) setCompletedOrders([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // Refetched whenever the bill list changes, so an order that was just
    // billed drops out of "eligible" without a manual page reload.
  }, [bills])

  // A completed order that already has a bill isn't eligible again — the
  // server enforces this for real (Bill.orderId is @unique), this is just
  // keeping the dropdown from offering an order the API would reject.
  const billedOrderIds = new Set(bills.map((bill) => bill.order.id))
  const eligibleOrders = completedOrders.filter((order) => !billedOrderIds.has(order.id))

  async function handleStatusChange(paymentStatus) {
    setIsUpdatingStatus(true)
    try {
      const updated = await billService.updatePaymentStatus(viewingBill.id, paymentStatus)
      setViewingBill(updated)
      refetch()
    } catch {
      refetch()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  function handleGenerated() {
    setIsGenerateOpen(false)
    refetch()
  }

  const columns = [
    { key: 'billNumber', header: 'Bill #', render: (row) => `#${String(row.billNumber).padStart(6, '0')}` },
    { key: 'customer', header: 'Customer', render: (row) => row.order.customer.fullName },
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row) => `#${String(row.order.orderNumber).padStart(6, '0')}`,
    },
    { key: 'subtotal', header: 'Subtotal', render: (row) => `$${Number(row.subtotal).toFixed(2)}` },
    { key: 'vatAmount', header: 'VAT', render: (row) => `$${Number(row.vatAmount).toFixed(2)}` },
    { key: 'discount', header: 'Discount', render: (row) => `-$${Number(row.discount).toFixed(2)}` },
    { key: 'grandTotal', header: 'Grand Total', render: (row) => `$${Number(row.grandTotal).toFixed(2)}` },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <button
            onClick={() => setViewingBill(row)}
            aria-label={`View bill #${row.billNumber}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setGenerateModalKey((key) => key + 1)
            setIsGenerateOpen(true)
          }}
          className="flex items-center gap-2 rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
        >
          <Receipt className="h-4 w-4" />
          Generate Bill
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={bills}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No bills generated yet."
      />

      <GenerateBillModal
        key={generateModalKey}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        eligibleOrders={eligibleOrders}
        onGenerated={handleGenerated}
      />

      <BillDetailsModal
        isOpen={Boolean(viewingBill)}
        onClose={() => setViewingBill(null)}
        bill={viewingBill}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
      />
    </div>
  )
}
