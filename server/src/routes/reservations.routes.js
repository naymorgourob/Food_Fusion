import { Router } from 'express'
import { authenticateUser, authorizeAdmin, authorizeCustomer } from '../middlewares/auth.middleware.js'
import {
  getReservations,
  postReservation,
  putReservationStatus,
  removeReservation,
} from '../controllers/reservation.controller.js'

const router = Router()

// GET is role-scoped inside the service itself (Admin: all, Customer: own)
// — not gated by authorizeAdmin/authorizeCustomer, since both roles call
// the same endpoint and get different, correctly-scoped results.
router.get('/', authenticateUser, getReservations)
router.post('/', authenticateUser, authorizeCustomer, postReservation)
router.put('/:id', authenticateUser, authorizeAdmin, putReservationStatus)
// Not authorizeAdmin: a Customer may cancel their OWN booking, which the
// service enforces (with the 404-not-403 privacy rule). Admin can still
// cancel any. Status updates below remain Admin-only — confirming a
// booking is the restaurant's decision, not the customer's.
router.delete('/:id', authenticateUser, removeReservation)

export default router
