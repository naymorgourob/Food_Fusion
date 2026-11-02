import crypto from 'node:crypto'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

// SSLCommerz hosted checkout: one session covers cards, bKash, Nagad,
// Rocket and internet banking on SSLCommerz's own secure page, so card
// details never touch this server.
const GATEWAY_HOST = env.sslcommerz.live
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com'
const SESSION_URL = `${GATEWAY_HOST}/gwprocess/v4/api.php`
const VALIDATION_URL = `${GATEWAY_HOST}/validator/api/validationserverAPI.php`

const PURPOSES = { order: 'ORDER', reservation: 'RESERVATION' }

function assertConfigured() {
  if (!env.sslcommerz.storeId || !env.sslcommerz.storePassword) {
    throw new ApiError(503, 'Online payment is not configured on this server.')
  }
}

function newTranId(purpose) {
  return `FF-${purpose[0]}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
}

// Loads the order/reservation the customer wants to pay the advance for,
// and refuses anything that isn't theirs or doesn't need paying.
async function loadPayable(purpose, id, user) {
  const record =
    purpose === 'ORDER'
      ? await prisma.order.findUnique({ where: { id }, include: { customer: true } })
      : await prisma.reservation.findUnique({ where: { id }, include: { customer: true } })
  if (!record)
    throw new ApiError(404, purpose === 'ORDER' ? 'Order not found.' : 'Reservation not found.')
  if (record.customerId !== user.id)
    throw new ApiError(403, 'You can only pay for your own booking.')
  if (record.advancePaid) throw new ApiError(409, 'The advance for this booking is already paid.')
  if (record.status === 'CANCELLED') throw new ApiError(409, 'This booking was cancelled.')
  if (Number(record.advanceAmount) <= 0) throw new ApiError(400, 'There is no advance to pay.')
  return record
}

/**
 * Starts a gateway session for the 30% advance on an order or reservation
 * and returns the SSLCommerz page to send the customer to.
 */
export async function initAdvancePayment(user, { type, id }) {
  assertConfigured()
  const purpose = PURPOSES[type]
  if (!purpose || !id)
    throw new ApiError(400, 'Specify what to pay for: an order or a reservation.')

  const record = await loadPayable(purpose, id, user)
  const tranId = newTranId(purpose)
  const amount = Number(record.advanceAmount).toFixed(2)

  await prisma.payment.create({
    data: {
      tranId,
      purpose,
      amount,
      customerId: user.id,
      orderId: purpose === 'ORDER' ? record.id : null,
      reservationId: purpose === 'RESERVATION' ? record.id : null,
    },
  })

  const callback = `${env.apiPublicUrl}/api/v1/payments/sslcommerz`
  const label =
    purpose === 'ORDER'
      ? `Advance for order #${String(record.orderNumber).padStart(6, '0')}`
      : 'Advance for table reservation'

  const form = new URLSearchParams({
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: amount,
    currency: 'BDT',
    tran_id: tranId,
    success_url: `${callback}/success`,
    fail_url: `${callback}/fail`,
    cancel_url: `${callback}/cancel`,
    ipn_url: `${callback}/ipn`,
    cus_name: record.customer.fullName,
    cus_email: record.customer.email,
    cus_phone: record.customer.phone || '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: label,
    product_category: purpose === 'ORDER' ? 'Food' : 'Reservation',
    product_profile: 'general',
    value_a: purpose,
    value_b: record.id,
  })

  let session
  try {
    const response = await fetch(SESSION_URL, { method: 'POST', body: form })
    session = await response.json()
  } catch {
    await markPayment(tranId, 'FAILED', { failureReason: 'Gateway unreachable' })
    throw new ApiError(502, 'Could not reach the payment gateway. Please try again.')
  }

  if (session.status !== 'SUCCESS' || !session.GatewayPageURL) {
    await markPayment(tranId, 'FAILED', {
      failureReason: session.failedreason || 'Session refused',
    })
    throw new ApiError(502, session.failedreason || 'The payment gateway refused the request.')
  }

  return { gatewayUrl: session.GatewayPageURL, tranId }
}

async function markPayment(tranId, status, data = {}) {
  // Only a PENDING payment moves; a late or repeated callback can't undo a
  // completed one.
  await prisma.payment.updateMany({
    where: { tranId, status: 'PENDING' },
    data: { status, ...data },
  })
}

// Asks SSLCommerz directly whether val_id is a real, valid payment. The
// browser redirect alone proves nothing — anyone can POST to success_url.
async function validateWithGateway(valId) {
  const query = new URLSearchParams({
    val_id: valId,
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    format: 'json',
  })
  const response = await fetch(`${VALIDATION_URL}?${query}`)
  return response.json()
}

/**
 * Handles the success callback (browser redirect or IPN). Returns the
 * payment record so the caller can redirect the customer to the result.
 */
export async function confirmPayment({ tran_id: tranId, val_id: valId }) {
  const payment = tranId ? await prisma.payment.findUnique({ where: { tranId } }) : null
  if (!payment) return null
  if (payment.status === 'PAID') return payment
  if (!valId) {
    await markPayment(tranId, 'FAILED', { failureReason: 'Missing validation ID' })
    return { ...payment, status: 'FAILED' }
  }

  let check
  try {
    check = await validateWithGateway(valId)
  } catch {
    // Leave it PENDING: the IPN or a retry can still confirm it.
    return payment
  }

  const valid =
    ['VALID', 'VALIDATED'].includes(check.status) &&
    check.tran_id === tranId &&
    check.currency_type === 'BDT' &&
    Math.abs(Number(check.currency_amount) - Number(payment.amount)) < 0.01

  if (!valid) {
    await markPayment(tranId, 'FAILED', {
      failureReason: `Validation failed (${check.status ?? 'unknown'})`,
    })
    return { ...payment, status: 'FAILED' }
  }

  const reference = `SSLCommerz ${check.bank_tran_id ?? valId}${check.card_type ? ` · ${check.card_type}` : ''}`
  const advance = { advancePaid: true, paymentReference: reference, paymentSubmittedAt: new Date() }

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { tranId, status: { not: 'PAID' } },
      data: {
        status: 'PAID',
        valId,
        bankTranId: check.bank_tran_id ?? null,
        cardType: check.card_type ?? null,
        paidAt: new Date(),
        failureReason: null,
      },
    }),
    payment.purpose === 'ORDER'
      ? prisma.order.update({ where: { id: payment.orderId }, data: advance })
      : prisma.reservation.update({ where: { id: payment.reservationId }, data: advance }),
  ])

  return { ...payment, status: 'PAID' }
}

export async function failPayment({ tran_id: tranId, error }, status) {
  if (!tranId) return null
  await markPayment(tranId, status, { failureReason: error || null })
  return prisma.payment.findUnique({ where: { tranId } })
}

// Where to send the customer's browser after the gateway.
export function resultUrl(payment, fallbackStatus = 'failed') {
  const params = new URLSearchParams({ status: fallbackStatus })
  if (payment) {
    params.set('status', payment.status === 'PAID' ? 'success' : payment.status.toLowerCase())
    params.set('type', payment.purpose === 'ORDER' ? 'order' : 'reservation')
    params.set('id', payment.orderId ?? payment.reservationId ?? '')
    params.set('amount', Number(payment.amount).toFixed(2))
  }
  return `${env.clientUrl}/payment/result?${params}`
}
