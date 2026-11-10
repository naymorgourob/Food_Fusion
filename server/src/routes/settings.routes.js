import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import {
  getSettingsHandler,
  getPaymentContactHandler,
  putSettingsHandler,
  getRestaurantStatusHandler,
  putRestaurantStatusHandler,
} from '../controllers/settings.controller.js'

const router = Router()

// Admin-only, per this part's Authorization section — no public GET,
// since nothing outside this app currently needs to read these values
// (Billing's VAT default reads settings.service.js directly, server-side).
router.get('/', authenticateUser, authorizeAdmin, getSettingsHandler)
router.get('/payment-contact', getPaymentContactHandler)
// Public: the website, customer, staff and admin screens all show whether
// the restaurant is open, including before anyone logs in.
router.get('/status', getRestaurantStatusHandler)
router.put('/status', authenticateUser, authorizeAdmin, putRestaurantStatusHandler)
router.put('/', authenticateUser, authorizeAdmin, putSettingsHandler)

export default router
