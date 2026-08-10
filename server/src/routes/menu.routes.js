import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import { uploadMenuImage } from '../config/multer.js'
import {
  getCategories,
  postCategory,
  putCategory,
  removeCategory,
} from '../controllers/category.controller.js'
import {
  getMenuItems,
  getMenuItem,
  postMenuItem,
  putMenuItem,
  removeMenuItem,
} from '../controllers/menuItem.controller.js'

const router = Router()

// Viewing the menu only requires being signed in (any role) — a future
// customer-facing browse feature reuses these same GET endpoints.
// Creating/editing/deleting is Admin-only.
router.get('/categories', authenticateUser, getCategories)
router.post('/categories', authenticateUser, authorizeAdmin, postCategory)
router.put('/categories/:id', authenticateUser, authorizeAdmin, putCategory)
router.delete('/categories/:id', authenticateUser, authorizeAdmin, removeCategory)

router.get('/items', authenticateUser, getMenuItems)
router.get('/items/:id', authenticateUser, getMenuItem)
router.post('/items', authenticateUser, authorizeAdmin, uploadMenuImage, postMenuItem)
router.put('/items/:id', authenticateUser, authorizeAdmin, uploadMenuImage, putMenuItem)
router.delete('/items/:id', authenticateUser, authorizeAdmin, removeMenuItem)

export default router
