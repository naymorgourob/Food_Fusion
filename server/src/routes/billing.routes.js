import { Router } from 'express'
import { authenticateUser, authorizeStaffOrAdmin } from '../middlewares/auth.middleware.js'
import { getBills, getBill, postBill, putBillPaymentStatus } from '../controllers/bill.controller.js'

const router = Router()

// GET is role-scoped inside the service itself (Admin/Staff: all,
// Customer: own) — same reasoning as orders.routes.js.
router.get('/', authenticateUser, getBills)
router.get('/:id', authenticateUser, getBill)
router.post('/', authenticateUser, authorizeStaffOrAdmin, postBill)
router.put('/:id', authenticateUser, authorizeStaffOrAdmin, putBillPaymentStatus)

export default router
