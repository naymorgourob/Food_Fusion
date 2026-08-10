const VALID_PAYMENT_STATUSES = ['PAID', 'UNPAID']

// Structural checks only — whether the order exists, is COMPLETED, and
// hasn't already been billed is a database question, answered in
// bill.service.js, same split used by every other validator/service pair.
export function validateGenerateBill({ orderId, vatPercent, discount }) {
  const errors = []

  if (!orderId || !String(orderId).trim()) errors.push('Order is required.')

  if (vatPercent !== undefined && vatPercent !== null && vatPercent !== '') {
    const value = Number(vatPercent)
    if (Number.isNaN(value) || value < 0 || value > 100) {
      errors.push('VAT must be a percentage between 0 and 100.')
    }
  }

  if (discount !== undefined && discount !== null && discount !== '') {
    const value = Number(discount)
    if (Number.isNaN(value) || value < 0) errors.push('Discount must be zero or a positive amount.')
  }

  return errors
}

export function validatePaymentStatus(status) {
  if (!status || !VALID_PAYMENT_STATUSES.includes(status)) {
    return ['Payment status must be either Paid or Unpaid.']
  }
  return []
}
