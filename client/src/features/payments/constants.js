// The advance is paid by sending money to one of the restaurant's accounts
// and entering the transaction ID; Admin checks it arrived and approves it.
// Account numbers come from Settings (GET /settings/payment-contact).
export const ADVANCE_METHODS = [
  { id: 'BKASH', label: 'bKash', accountLabel: 'bKash number' },
  { id: 'NAGAD', label: 'Nagad', accountLabel: 'Nagad number' },
  { id: 'ROCKET', label: 'Rocket', accountLabel: 'Rocket number' },
  { id: 'BANK', label: 'Bank transfer', accountLabel: 'Bank account' },
]

export const PAY_AT_RESTAURANT = 'AT_RESTAURANT'

export const PAYMENT_METHOD_LABELS = {
  ...Object.fromEntries(ADVANCE_METHODS.map(({ id, label }) => [id, label])),
  [PAY_AT_RESTAURANT]: 'Pay at the restaurant',
}

// Methods the restaurant has an account for, in display order.
export function availableAdvanceMethods(accounts) {
  return ADVANCE_METHODS.filter(({ id }) => accounts?.[id]?.trim())
}
