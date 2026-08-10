import { useState } from 'react'
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { StaffFormModal } from '@/features/staff/components/StaffFormModal'
import { useStaff } from '@/features/staff/hooks/useStaff'
import * as staffService from '@/features/staff/services/staffService'

// Admin-only (see App.jsx) — this part's Authorization section grants no
// other role any access to this module.
export default function StaffPage() {
  const { staff, isLoading, refetch } = useStaff()

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Same modalKey remount pattern as TablesPage — without it, two
  // successive "Add Staff" opens would share the same 'create' key and the
  // second would start from whatever was left over in the first.
  const [modalKey, setModalKey] = useState(0)

  const [togglingId, setTogglingId] = useState(null)

  function openCreateModal() {
    setEditingStaff(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(staffMember) {
    setEditingStaff(staffMember)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function closeFormModal() {
    setFormModalOpen(false)
    setEditingStaff(null)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, payload)
      } else {
        await staffService.createStaff(payload)
      }
      closeFormModal()
      refetch()
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setFormErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  // Same "trivially reversible, no ConfirmDialog needed" reasoning as
  // CustomersPage's status toggle.
  async function handleToggleStatus(staffMember) {
    setTogglingId(staffMember.id)
    try {
      await staffService.updateStaffStatus(staffMember.id, !staffMember.isActive)
      refetch()
    } finally {
      setTogglingId(null)
    }
  }

  const columns = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'position', header: 'Position' },
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
            onClick={() => openEditModal(row)}
            aria-label={`Edit ${row.fullName}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
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
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
        >
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={staff}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No staff accounts yet — add your first one to get started."
      />

      <StaffFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        staffMember={editingStaff}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />
    </div>
  )
}
