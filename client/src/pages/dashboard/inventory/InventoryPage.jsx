import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { InventoryFormModal } from '@/features/inventory/components/InventoryFormModal'
import { useInventory } from '@/features/inventory/hooks/useInventory'
import * as inventoryService from '@/features/inventory/services/inventoryService'

const STATUS_STYLES = {
  IN_STOCK: 'bg-success-soft text-success',
  LOW_STOCK: 'bg-warning-soft text-warning',
  OUT_OF_STOCK: 'bg-danger-soft text-danger',
}

const STATUS_LABELS = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
}

const UNIT_LABELS = {
  KG: 'Kg',
  GRAM: 'Gram',
  LITER: 'Liter',
  ML: 'Ml',
  PIECE: 'Piece',
  BOX: 'Box',
  PACK: 'Pack',
}

// Admin-only (see App.jsx) — this part's Authorization section grants no
// other role any access to this module.
export default function InventoryPage() {
  const { items, isLoading, refetch } = useInventory()

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formErrors, setFormErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Same modalKey remount pattern as TablesPage/StaffPage — without it,
  // two successive "Add Item" opens would share the same 'create' key.
  const [modalKey, setModalKey] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreateModal() {
    setEditingItem(null)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setFormErrors([])
    setModalKey((key) => key + 1)
    setFormModalOpen(true)
  }

  function closeFormModal() {
    setFormModalOpen(false)
    setEditingItem(null)
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true)
    setFormErrors([])
    try {
      if (editingItem) {
        await inventoryService.updateInventoryItem(editingItem.id, payload)
      } else {
        await inventoryService.createInventoryItem(payload)
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
      await inventoryService.deleteInventoryItem(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (error) {
      setDeleteError(error.response?.data?.message ?? 'Failed to delete inventory item.')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => `${Number(row.quantity)} ${UNIT_LABELS[row.unit]}`,
    },
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
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEditModal(row)}
            aria-label={`Edit ${row.itemName}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeleteError('')
              setDeleteTarget(row)
            }}
            aria-label={`Delete ${row.itemName}`}
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
          <Plus className="h-4 w-4" /> Add Inventory Item
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No inventory items yet — add your first one to get started."
      />

      <InventoryFormModal
        key={modalKey}
        isOpen={formModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        item={editingItem}
        isSubmitting={isSubmitting}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.itemName}"? This cannot be undone.`}
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
