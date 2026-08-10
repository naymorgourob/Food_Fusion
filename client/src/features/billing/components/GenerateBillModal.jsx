import { useState } from 'react'
import { Modal } from '@/components/dashboard/Modal'
import { generateBill } from '@/features/billing/services/billService'

const DEFAULT_VAT_PERCENT = 13

const EMPTY_FORM = { orderId: '', vatPercent: String(DEFAULT_VAT_PERCENT), discount: '0' }

/**
 * `eligibleOrders` is computed by the page (COMPLETED orders that don't
 * already have a bill) — this modal just renders whatever list it's given
 * and lets Admin/Staff pick one, mirroring how MenuItemFormModal/
 * TableFormModal never own their own data fetching either. The parent
 * (BillingPage) remounts this with a fresh `key` every time it's opened —
 * see CategoryFormModal for the same reset-on-remount pattern — so this
 * initial state, read once per mount, is always correct without an effect.
 */
export function GenerateBillModal({ isOpen, onClose, eligibleOrders, onGenerated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const selectedOrder = eligibleOrders.find((order) => order.id === form.orderId)
  const subtotal = selectedOrder ? Number(selectedOrder.totalAmount) : 0
  const vatAmount = subtotal * (Number(form.vatPercent || 0) / 100)
  const grandTotal = subtotal + vatAmount - Number(form.discount || 0)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])

    if (!form.orderId) {
      setErrors(['Select an order to bill.'])
      return
    }

    setIsSubmitting(true)
    try {
      const bill = await generateBill({
        orderId: form.orderId,
        vatPercent: form.vatPercent,
        discount: form.discount,
      })
      onGenerated(bill)
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Failed to generate bill.'
      setErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Bill" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.length > 0 && (
          <ul className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bill-order" className="text-sm font-medium text-ink">
            Completed Order
          </label>
          <select
            id="bill-order"
            required
            value={form.orderId}
            onChange={updateField('orderId')}
            className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
          >
            <option value="" disabled>
              {eligibleOrders.length === 0 ? 'No unbilled completed orders' : 'Select a completed order'}
            </option>
            {eligibleOrders.map((order) => (
              <option key={order.id} value={order.id}>
                #{String(order.orderNumber).padStart(6, '0')} — {order.customer.fullName} — $
                {Number(order.totalAmount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill-vat" className="text-sm font-medium text-ink">
              VAT (%)
            </label>
            <input
              id="bill-vat"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.vatPercent}
              onChange={updateField('vatPercent')}
              className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill-discount" className="text-sm font-medium text-ink">
              Discount ($)
            </label>
            <input
              id="bill-discount"
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={updateField('discount')}
              className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100"
            />
          </div>
        </div>

        {selectedOrder && (
          <div className="flex flex-col gap-1 rounded-lg border border-border p-4 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>VAT</span>
              <span>${vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Discount</span>
              <span>-${Number(form.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold text-ink">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || eligibleOrders.length === 0}
          className="self-start rounded-md bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Generating…' : 'Generate Bill'}
        </button>
      </form>
    </Modal>
  )
}
