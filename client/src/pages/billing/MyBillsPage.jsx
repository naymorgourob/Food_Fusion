import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { DataTable } from '@/components/dashboard/DataTable'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { useBills } from '@/features/billing/hooks/useBills'
import { ROUTES } from '@/constants'

// Customer-facing, read-only — per this part's Authorization section,
// Customers can only view their own bills (Admin/Staff generate them and
// update payment status, from /dashboard/billing). No DashboardLayout,
// same shape as MyOrdersPage/MyReservationsPage.
export default function MyBillsPage() {
  const { bills, isLoading } = useBills()

  const columns = [
    { key: 'billNumber', header: 'Bill #', render: (row) => `#${String(row.billNumber).padStart(6, '0')}` },
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row) => `#${String(row.order.orderNumber).padStart(6, '0')}`,
    },
    { key: 'billDate', header: 'Bill Date', render: (row) => new Date(row.billDate).toLocaleDateString() },
    { key: 'subtotal', header: 'Subtotal', render: (row) => `$${Number(row.subtotal).toFixed(2)}` },
    {
      key: 'vatAmount',
      header: 'VAT',
      render: (row) => `$${Number(row.vatAmount).toFixed(2)} (${Number(row.vatPercent)}%)`,
    },
    { key: 'discount', header: 'Discount', render: (row) => `-$${Number(row.discount).toFixed(2)}` },
    { key: 'grandTotal', header: 'Grand Total', render: (row) => `$${Number(row.grandTotal).toFixed(2)}` },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link to={ROUTES.ACCOUNT} className="text-sm font-medium text-ink-muted hover:text-ink">
          Back to account
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-h4 font-semibold text-ink">My Bills</h2>
        <DataTable
          columns={columns}
          rows={bills}
          getRowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="You have no bills yet."
        />
      </div>
    </div>
  )
}
