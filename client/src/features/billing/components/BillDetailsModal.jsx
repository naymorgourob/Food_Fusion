import { Modal } from '@/components/dashboard/Modal'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'

const STATUS_OPTIONS = ['UNPAID', 'PAID']

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  )
}

function Money({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">${Number(value).toFixed(2)}</span>
    </div>
  )
}

/**
 * Read-only bill breakdown plus the one thing Admin/Staff can actually
 * change here: payment status. Subtotal/VAT/discount/grand total are all
 * a snapshot taken at generation time (see bill.service.js) — never
 * recalculated live from the order.
 */
export function BillDetailsModal({ isOpen, onClose, bill, onStatusChange, isUpdatingStatus }) {
  if (!bill) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bill #${String(bill.billNumber).padStart(6, '0')}`} size="md">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer" value={bill.order.customer.fullName} />
          <Field label="Order" value={`#${String(bill.order.orderNumber).padStart(6, '0')}`} />
          <Field label="Bill Date" value={new Date(bill.billDate).toLocaleString()} />
          <Field label="VAT Rate" value={`${Number(bill.vatPercent)}%`} />
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-4">
          <Money label="Subtotal" value={bill.subtotal} />
          <Money label={`VAT (${Number(bill.vatPercent)}%)`} value={bill.vatAmount} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">Discount</span>
            <span className="text-sm font-medium text-ink">-${Number(bill.discount).toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-semibold text-ink">Grand Total</span>
            <span className="text-sm font-bold text-ink">${Number(bill.grandTotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment Status</span>
            <PaymentStatusBadge status={bill.paymentStatus} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill-payment-status" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Update Status
            </label>
            <select
              id="bill-payment-status"
              value={bill.paymentStatus}
              disabled={isUpdatingStatus}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}
