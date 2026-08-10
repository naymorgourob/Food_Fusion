import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RotateCcw } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { DataTable } from '@/components/dashboard/DataTable'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { orderGrandTotal } from '@/features/orders/constants'
import { ROUTES } from '@/constants'

// "Current" is everything short of a terminal state — matches the status
// flow in OrderProgressTracker.jsx exactly.
const TABS = [
  {
    key: 'current',
    label: 'Current Orders',
    statuses: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'],
  },
  { key: 'completed', label: 'Completed Orders', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelled Orders', statuses: ['CANCELLED'] },
]

// Customer-facing page, no DashboardLayout — same shape as
// MyReservationsPage. The old inline CustomerOrderForm is gone — placing
// an order is now its own page (NewOrderPage, the Smart Ordering wizard);
// this page is purely the three order-status tabs plus a link into it.
export default function MyOrdersPage() {
  const { orders, isLoading } = useOrders()
  const [activeTab, setActiveTab] = useState('current')

  const activeStatuses = TABS.find((tab) => tab.key === activeTab).statuses
  const filteredOrders = orders.filter((order) => activeStatuses.includes(order.status))

  const columns = [
    { key: 'orderNumber', header: 'Order #', render: (row) => `#${String(row.orderNumber).padStart(6, '0')}` },
    { key: 'orderType', header: 'Type', render: (row) => <OrderTypeBadge orderType={row.orderType} /> },
    {
      key: 'items',
      header: 'Items',
      render: (row) => row.items.map((item) => `${item.menuItem.name} x${item.quantity}`).join(', '),
    },
    { key: 'status', header: 'Status', render: (row) => <OrderStatusBadge status={row.status} /> },
    { key: 'totalAmount', header: 'Total', render: (row) => `$${orderGrandTotal(row).toFixed(2)}` },
    { key: 'createdAt', header: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-3 whitespace-nowrap">
          <Link to={`${ROUTES.ORDERS}/${row.id}`} className="text-sm font-medium text-ember-600 hover:text-ember-700">
            View Details
          </Link>
          {/* Part 18.1 — hands the wizard a ?repeat= id; it copies the
              items into the cart where quantities stay editable. Offered
              on finished orders only: repeating an order that hasn't even
              arrived yet is far more likely a misclick than an intent. */}
          {(row.status === 'COMPLETED' || row.status === 'CANCELLED') && (
            <Link
              to={`${ROUTES.ORDERS}/new?repeat=${row.id}`}
              className="flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Order Again
            </Link>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link to={ROUTES.ACCOUNT} className="text-sm font-medium text-ink-muted hover:text-ink">
          Back to account
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">My Orders</h1>
        <Link
          to={`${ROUTES.ORDERS}/new`}
          className="flex items-center gap-2 rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
        >
          <Plus className="h-4 w-4" /> Place New Order
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.key ? 'border-ember-600 text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filteredOrders}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No orders here yet."
      />
    </div>
  )
}
