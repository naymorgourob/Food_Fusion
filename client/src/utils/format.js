/**
 * Display formatters shared across the customer app. Kept out of any
 * component file so fast refresh isn't disabled for a component module
 * (react-refresh only tolerates component exports).
 */
export const money = (value) => `$${Number(value).toFixed(2)}`

/** Zero-padded reference, e.g. 42 -> "#000042". Used for orders and invoices. */
export const orderNo = (value) => `#${String(value).padStart(6, '0')}`
