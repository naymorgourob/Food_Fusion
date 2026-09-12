/**
 * Display formatters shared across FoodFusion. Kept out of any
 * component file so fast refresh isn't disabled for a component module
 * (react-refresh only tolerates component exports).
 */
export const CURRENCY_SYMBOL = '৳'

/**
 * Formats monetary amounts in Bangladeshi Taka (৳ / BDT).
 * Example: 500 -> "৳500.00", 1250 -> "৳1,250.00"
 */
export const money = (value) => {
  const num = Number(value)
  const valid = !isNaN(num) ? num : 0
  return `${CURRENCY_SYMBOL}${valid.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Zero-padded reference, e.g. 42 -> "#000042". Used for orders and invoices. */
export const orderNo = (value) => `#${String(value).padStart(6, '0')}`
