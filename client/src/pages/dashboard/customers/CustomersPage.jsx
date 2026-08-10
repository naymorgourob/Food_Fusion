import { useState } from 'react'
import { Eye, UserCheck, UserX } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { CustomerDetailsModal } from '@/features/customers/components/CustomerDetailsModal'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import * as customerService from '@/features/customers/services/customerService'

// Admin-only (see App.jsx) — this part's Authorization section grants no
// other role any access to this module.
export default function CustomersPage() {
  const { customers, isLoading, refetch } = useCustomers()
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  // Activate/Deactivate is trivially reversible (click it again), unlike
  // Cancel/Delete elsewhere in this app — so it's a direct action, no
  // ConfirmDialog. Customers can never be deleted at all (see spec).
  async function handleToggleStatus(customer) {
    setTogglingId(customer.id)
    try {
      await customerService.updateCustomerStatus(customer.id, !customer.isActive)
      refetch()
    } finally {
      setTogglingId(null)
    }
  }

  const columns = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'createdAt',
      header: 'Registration Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            row.isActive ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-muted'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setViewingCustomer(row)}
            aria-label={`View ${row.fullName}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            disabled={togglingId === row.id}
            aria-label={row.isActive ? `Deactivate ${row.fullName}` : `Activate ${row.fullName}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        columns={columns}
        rows={customers}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No customers have registered yet."
      />

      <CustomerDetailsModal
        isOpen={Boolean(viewingCustomer)}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
      />
    </div>
  )
}
