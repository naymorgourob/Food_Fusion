import { Router } from 'express'
import { authenticateUser, authorizeAdmin, authorizeStaffOrAdmin } from '../middlewares/auth.middleware.js'
import {
  getInventoryItems,
  postInventoryItem,
  putInventoryItem,
  patchInventoryStock,
  removeInventoryItem,
} from '../controllers/inventory.controller.js'

const router = Router()

// Kitchen Staff & Admin can view inventory and update stock levels
router.get('/', authenticateUser, authorizeStaffOrAdmin, getInventoryItems)
router.patch('/:id/stock', authenticateUser, authorizeStaffOrAdmin, patchInventoryStock)

// Admin-only item creation, full schema update, and deletion
router.post('/', authenticateUser, authorizeAdmin, postInventoryItem)
router.put('/:id', authenticateUser, authorizeAdmin, putInventoryItem)
router.delete('/:id', authenticateUser, authorizeAdmin, removeInventoryItem)

export default router
