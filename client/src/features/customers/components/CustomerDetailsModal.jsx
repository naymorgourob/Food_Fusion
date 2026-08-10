import { Modal } from '@/components/dashboard/Modal'

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  )
}

// Purely read-only — per this part's Customer Management features, "View
// Customer" is a separate item from "Activate/Deactivate", which lives as
// a row action in CustomersPage instead (same split Order/Reservation
// details modals draw between viewing and the one control they do own,
// except here the customer's status isn't editable from inside the modal).
export function CustomerDetailsModal({ isOpen, onClose, customer }) {
  if (!customer) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="sm">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" value={customer.fullName} />
        <Field label="Email" value={customer.email} />
        <Field label="Phone" value={customer.phone} />
        <Field label="Registration Date" value={new Date(customer.createdAt).toLocaleDateString()} />
        <Field
          label="Status"
          value={
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                customer.isActive ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-muted'
              }`}
            >
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
          }
        />
      </div>
    </Modal>
  )
}
