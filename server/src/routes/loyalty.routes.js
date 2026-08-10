import { Router } from 'express'
import { authenticateUser, authorizeCustomer } from '../middlewares/auth.middleware.js'
import { getMyLoyalty, getMyTransactions } from '../controllers/loyalty.controller.js'

const router = Router()

// Customer-only: loyalty points are a customer concept, and both handlers
// scope to req.user.id, so there is no id in the path to authorize against.
router.get('/me', authenticateUser, authorizeCustomer, getMyLoyalty)
router.get('/me/transactions', authenticateUser, authorizeCustomer, getMyTransactions)

export default router
