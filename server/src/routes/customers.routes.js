import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import { getCustomers, getCustomer, patchCustomerStatus } from '../controllers/customer.controller.js'

const router = Router()

// Admin-only, per this part's Authorization section — no GET/GET-by-id
// loosening for other roles, unlike Menu or Tables in earlier parts.
router.get('/', authenticateUser, authorizeAdmin, getCustomers)
router.get('/:id', authenticateUser, authorizeAdmin, getCustomer)
router.patch('/:id/status', authenticateUser, authorizeAdmin, patchCustomerStatus)

export default router
