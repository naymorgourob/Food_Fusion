/**
 * The one place bill money math happens — used only by bill.service.js,
 * so the subtotal/VAT/discount/grand-total formula is never duplicated.
 * Always works in Prisma's Decimal (decimal.js), never a plain JS number,
 * for the same reason Order's totalAmount does — exact money math.
 */
export function calculateBillTotals(subtotal, vatPercent, discount) {
  const vatAmount = subtotal.mul(vatPercent).div(100)
  const grandTotal = subtotal.add(vatAmount).sub(discount)
  return { vatAmount, grandTotal }
}
