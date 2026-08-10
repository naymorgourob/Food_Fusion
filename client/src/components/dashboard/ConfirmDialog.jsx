import { Modal } from '@/components/dashboard/Modal'

/**
 * Generic confirm/cancel dialog built on Modal — used for every destructive
 * action (deleting a category, deleting a menu item, and whatever a future
 * module needs to confirm) so "are you sure?" always looks and behaves
 * the same way.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirming,
  error,
  // Defaults match the original delete-confirmation usage (Category, Table,
  // Menu Item); Reservation's "cancel" action overrides these, since a
  // "Delete" button on a Cancel Reservation dialog would be a real,
  // confusing mismatch between label and actual effect.
  dismissLabel = 'Cancel',
  confirmLabel = 'Delete',
  confirmingLabel = 'Deleting…',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-muted">{message}</p>
        {error && (
          <p className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2"
          >
            {dismissLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
