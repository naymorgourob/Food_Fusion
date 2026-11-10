import { Router } from 'express'
import {
  authenticateUser,
  authorizeStaffOrAdmin,
  requireRestaurantOpen,
} from '../middlewares/auth.middleware.js'
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
import { uploadPaymentProof } from '../config/multer.js'

const router = Router()

// GET is role-scoped inside the service itself (Admin/Staff: all,
// Customer: own) — same reasoning as reservations.routes.js.
router.get('/', authenticateUser, getOrders)
// Must come before '/:id' — otherwise Express would treat
// "assignable-staff" as an :id value.
router.get('/assignable-staff', authenticateUser, authorizeStaffOrAdmin, getAssignableStaff)
router.get('/:id', authenticateUser, getOrder)
// Customer places own order; Waiter/Staff places dining or takeaway order for guests.
// requireRestaurantOpen: order work only happens during opening hours
// (Admin is exempt). Cancelling stays allowed at any time.
router.post('/', authenticateUser, requireRestaurantOpen, uploadPaymentProof, postOrder)
router.put('/:id', authenticateUser, authorizeStaffOrAdmin, requireRestaurantOpen, putOrderStatus)
router.patch(
  '/:id/assign-staff',
  authenticateUser,
  authorizeStaffOrAdmin,
  requireRestaurantOpen,
  patchAssignStaff,
)
router.patch(
  '/:id/estimated-time',
  authenticateUser,
  authorizeStaffOrAdmin,
  requireRestaurantOpen,
  patchEstimatedTime,
)
// Role-scoped inside cancelOrder itself (owning Customer, or Admin/Staff)
// — Part 18 adds a Cancel button to the customer's own tracking page,
// alongside the Admin/Staff cancel action from Part 12.
router.delete('/:id', authenticateUser, removeOrder)

export default router
