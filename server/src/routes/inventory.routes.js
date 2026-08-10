import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import {
  getInventoryItems,
  postInventoryItem,
  putInventoryItem,
  removeInventoryItem,
} from '../controllers/inventory.controller.js'

const router = Router()

// Admin-only, per this part's Authorization section.
router.get('/', authenticateUser, authorizeAdmin, getInventoryItems)
router.post('/', authenticateUser, authorizeAdmin, postInventoryItem)
router.put('/:id', authenticateUser, authorizeAdmin, putInventoryItem)
router.delete('/:id', authenticateUser, authorizeAdmin, removeInventoryItem)

export default router
