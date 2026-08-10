import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.ts'
import { getSettings } from './settings.service.js'

// Minimum current-balance points to hold each tier. Ordered high -> low so
// the first match in getMembershipLevel wins. Kept as a constant rather
// than Settings fields: the spec asks for these four fixed tiers, and
// making the thresholds admin-editable too would be scope beyond
// "automatically determine membership level based on current points."
const MEMBERSHIP_TIERS = [
  { level: 'PLATINUM', minPoints: 1000 },
  { level: 'GOLD', minPoints: 500 },
  { level: 'SILVER', minPoints: 200 },
  { level: 'BRONZE', minPoints: 0 },
]

export function getMembershipLevel(currentPoints) {
  return MEMBERSHIP_TIERS.find((tier) => currentPoints >= tier.minPoints).level
}

// The tier above the current one, so the dashboard can show "180 points to
// Gold". Null once Platinum is reached — there is nothing further to earn.
function getNextTier(currentPoints) {
  const higher = MEMBERSHIP_TIERS.filter((tier) => tier.minPoints > currentPoints)
  if (higher.length === 0) return null
  // filter preserves the high->low order, so the *last* entry is the
  // nearest tier above the current balance.
  const next = higher[higher.length - 1]
  return { level: next.level, minPoints: next.minPoints, pointsAway: next.minPoints - currentPoints }
}

/**
 * The customer's balance is derived from the ledger every time, never read
 * from a stored column — see the LoyaltyTransaction comment in
 * schema.prisma for why there deliberately isn't one.
 */
export async function getLoyaltySummary(customerId) {
  const grouped = await prisma.loyaltyTransaction.groupBy({
    by: ['type'],
    where: { customerId },
    _sum: { points: true },
  })

  const sumFor = (type) => grouped.find((row) => row.type === type)?._sum.points ?? 0

  const earned = sumFor('EARNED')
  const bonus = sumFor('BONUS')
  const redeemed = sumFor('REDEEMED')
  // "Total Earned" as the customer understands it includes bonuses — both
  // are points that arrived in their account.
  const totalEarned = earned + bonus
  const currentPoints = totalEarned - redeemed

  const settings = await getSettings()

  return {
    currentPoints,
    totalEarned,
    totalRedeemed: redeemed,
    membershipLevel: getMembershipLevel(currentPoints),
    nextTier: getNextTier(currentPoints),
    // Echoed so the checkout screen can show what points are worth
    // without a second Settings request (which Customers can't make —
    // GET /settings is Admin-only).
    pointValue: Number(settings.loyaltyPointValue),
  }
}

export async function listTransactions(customerId) {
  return prisma.loyaltyTransaction.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { order: { select: { id: true, orderNumber: true } } },
  })
}

// Shared by every award path (order completion, first-order bonus).
// `tx` lets callers pass a Prisma transaction client so awarding can be
// atomic with whatever else they're doing; defaults to the normal client.
export async function recordTransaction({ customerId, type, points, reason, orderId = null }, tx = prisma) {
  if (points <= 0) return null
  return tx.loyaltyTransaction.create({
    data: { customerId, type, points, reason, orderId },
  })
}

/**
 * Called when an order reaches COMPLETED. Idempotent: if this order has
 * already generated an EARNED row, nothing further happens — so a staff
 * member flipping status away from and back to Completed can never
 * double-award. Awards the first-order bonus in the same breath when this
 * is the customer's first-ever earning order.
 *
 * `settings` is passed in rather than fetched here on purpose. When this
 * runs inside a transaction, every query must go through that same `tx`
 * client — calling getSettings() (which uses the global client, a
 * different connection) would block on the transaction's own uncommitted
 * writes until Prisma's 5s interactive-transaction timeout killed it.
 * Callers read Settings before opening the transaction.
 */
export async function awardPointsForCompletedOrder(order, settings, tx = prisma) {
  const alreadyAwarded = await tx.loyaltyTransaction.findFirst({
    where: { orderId: order.id, type: 'EARNED' },
  })
  if (alreadyAwarded) return

  const rate = new Prisma.Decimal(settings.loyaltyPointsPerCurrency)

  // Points are earned on what the customer actually paid for food —
  // delivery charge isn't a purchase, and the loyalty discount they
  // already redeemed shouldn't earn them points a second time.
  const eligibleAmount = Prisma.Decimal.max(
    new Prisma.Decimal(order.totalAmount).sub(order.loyaltyDiscount ?? 0),
    new Prisma.Decimal(0),
  )
  const points = eligibleAmount.mul(rate).floor().toNumber()

  await recordTransaction(
    { customerId: order.customerId, type: 'EARNED', points, reason: 'Order completed', orderId: order.id },
    tx,
  )

  // "The very first successful order" — checked against EARNED rows only,
  // so a previously granted bonus can't itself satisfy the condition.
  const priorEarned = await tx.loyaltyTransaction.count({
    where: { customerId: order.customerId, type: 'EARNED', NOT: { orderId: order.id } },
  })
  if (priorEarned === 0 && settings.firstOrderBonusPoints > 0) {
    await recordTransaction(
      {
        customerId: order.customerId,
        type: 'BONUS',
        points: settings.firstOrderBonusPoints,
        reason: 'First order bonus',
        orderId: order.id,
      },
      tx,
    )
  }
}
