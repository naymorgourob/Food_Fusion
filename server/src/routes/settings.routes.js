import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import { getSettingsHandler, putSettingsHandler } from '../controllers/settings.controller.js'

const router = Router()

// Admin-only, per this part's Authorization section — no public GET,
// since nothing outside this app currently needs to read these values
// (Billing's VAT default reads settings.service.js directly, server-side).
router.get('/', authenticateUser, authorizeAdmin, getSettingsHandler)
router.put('/', authenticateUser, authorizeAdmin, putSettingsHandler)

export default router
