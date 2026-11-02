import { Router } from 'express'
import { authenticateUser, authorizeCustomer } from '../middlewares/auth.middleware.js'
import {
  postInitPayment,
  postGatewaySuccess,
  postGatewayFail,
  postGatewayCancel,
  postGatewayIpn,
} from '../controllers/payment.controller.js'

const router = Router()

// Customer starts paying the advance on their own order/reservation.
router.post('/sslcommerz/init', authenticateUser, authorizeCustomer, postInitPayment)

// Called by SSLCommerz (browser redirect / IPN), so no auth token — the
// success path is verified against SSLCommerz's validation API instead.
router.post('/sslcommerz/success', postGatewaySuccess)
router.post('/sslcommerz/fail', postGatewayFail)
router.post('/sslcommerz/cancel', postGatewayCancel)
router.post('/sslcommerz/ipn', postGatewayIpn)

export default router
