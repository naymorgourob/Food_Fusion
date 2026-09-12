import { Router } from 'express'
import { authenticateUser, authorizeStaffOrAdmin } from '../middlewares/auth.middleware.js'
import {
  getOrders,
  getOrder,
  getAssignableStaff,
  postOrder,
  putOrderStatus,
  patchAssignStaff,
  patchEstimatedTime,
  removeOrder,
} from '../controllers/order.controller.js'

const router = Router()

// GET is role-scoped inside the service itself (Admin/Staff: all,
// Customer: own) — same reasoning as reservations.routes.js.
router.get('/', authenticateUser, getOrders)
// Must come before '/:id' — otherwise Express would treat
// "assignable-staff" as an :id value.
router.get('/assignable-staff', authenticateUser, authorizeStaffOrAdmin, getAssignableStaff)
router.get('/:id', authenticateUser, getOrder)
// Customer places own order; Waiter/Staff places dining or takeaway order for guests
router.post('/', authenticateUser, postOrder)
router.put('/:id', authenticateUser, authorizeStaffOrAdmin, putOrderStatus)
router.patch('/:id/assign-staff', authenticateUser, authorizeStaffOrAdmin, patchAssignStaff)
router.patch('/:id/estimated-time', authenticateUser, authorizeStaffOrAdmin, patchEstimatedTime)
// Role-scoped inside cancelOrder itself (owning Customer, or Admin/Staff)
// — Part 18 adds a Cancel button to the customer's own tracking page,
// alongside the Admin/Staff cancel action from Part 12.
router.delete('/:id', authenticateUser, removeOrder)

export default router
