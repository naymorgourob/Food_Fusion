import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { TableFormModal } from '@/features/tables/components/TableFormModal'
import { useTables } from '@/features/tables/hooks/useTables'
import * as tableService from '@/features/tables/services/tableService'

const STATUS_STYLES = {
  AVAILABLE: 'bg-success-soft text-success',
  OCCUPIED: 'bg-danger-soft text-danger',
  RESERVED: 'bg-warning-soft text-warning',
  INACTIVE: 'bg-surface-2 text-ink-muted',
}

const STATUS_LABELS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  INACTIVE: 'Inactive',
}

export default function TablesPage() {
  const { tables, isLoading, refetch } = useTables()

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Bumped on every open (create or edit) so TableFormModal always
  // remounts with a fresh initial state — keying only on editingTable?.id
  // would leave two *successive* "Add Table" opens sharing the same
  // 'create' key, so the second one would start from whatever was left
  // over in the form from the first, instead of blank.
  const [modalKey, setModalKey] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreateModal() {
    setEditingTable(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(table) {
    setEditingTable(table)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function closeFormModal() {
    setFormModalOpen(false)
    setEditingTable(null)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable.id, payload)
      } else {
        await tableService.createTable(payload)
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

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await tableService.deleteTable(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      setDeleteError(error.response?.data?.message ?? 'Failed to delete table.')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'number', header: 'Table Number', render: (row) => `Table ${row.number}` },
    { key: 'capacity', header: 'Capacity', render: (row) => `${row.capacity} seats` },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[row.status]}`}>
          {STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => row.description || <span className="text-ink-faint">—</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEditModal(row)}
            aria-label={`Edit Table ${row.number}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeleteError('')
              setDeleteTarget(row)
            }}
            aria-label={`Delete Table ${row.number}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
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
          <Plus className="h-4 w-4" /> Add Table
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={tables}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No tables yet — add your first one to get started."
      />

      <TableFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        table={editingTable}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Table"
        message={`Are you sure you want to delete Table ${deleteTarget?.number}? This cannot be undone.`}
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
