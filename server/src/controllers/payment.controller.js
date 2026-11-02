import { sendSuccess } from '../utils/ApiResponse.js'
import {
  initAdvancePayment,
  confirmPayment,
  failPayment,
  resultUrl,
} from '../services/payment.service.js'

export async function postInitPayment(req, res) {
  const session = await initAdvancePayment(req.user, req.body)
  sendSuccess(res, { message: 'Payment session created.', data: session })
}

// SSLCommerz posts the customer's browser back here; each handler records
// the outcome and redirects to the client's result page.
export async function postGatewaySuccess(req, res) {
  const payment = await confirmPayment(req.body)
  res.redirect(303, resultUrl(payment))
}

export async function postGatewayFail(req, res) {
  const payment = await failPayment(req.body, 'FAILED')
  res.redirect(303, resultUrl(payment))
}

export async function postGatewayCancel(req, res) {
  const payment = await failPayment(req.body, 'CANCELLED')
  res.redirect(303, resultUrl(payment, 'cancelled'))
}

// Server-to-server notification (only reaches a publicly hosted API).
export async function postGatewayIpn(req, res) {
  if (req.body.status === 'VALID' || req.body.status === 'VALIDATED') await confirmPayment(req.body)
  res.status(200).json({ received: true })
}
