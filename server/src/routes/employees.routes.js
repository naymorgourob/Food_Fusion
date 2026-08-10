import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import {
  getStaffList,
  getStaffMember,
  postStaff,
  putStaff,
  patchStaffStatus,
} from '../controllers/staff.controller.js'

const router = Router()

// "Staff" in the spec/UI, "employees" as the resource name here — this is
// the same route file scaffolded (empty) back in Part 8, filled in now.
// Admin-only, per this part's Authorization section.
router.get('/', authenticateUser, authorizeAdmin, getStaffList)
router.get('/:id', authenticateUser, authorizeAdmin, getStaffMember)
router.post('/', authenticateUser, authorizeAdmin, postStaff)
router.put('/:id', authenticateUser, authorizeAdmin, putStaff)
router.patch('/:id/status', authenticateUser, authorizeAdmin, patchStaffStatus)

export default router
