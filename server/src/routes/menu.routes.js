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

// Viewing the menu is public, like a menu in the window: the landing page
// shows real dishes to visitors who haven't signed in. Creating, editing
// and deleting stay Admin-only.
router.get('/categories', getCategories)
router.post('/categories', authenticateUser, authorizeAdmin, postCategory)
router.put('/categories/:id', authenticateUser, authorizeAdmin, putCategory)
router.delete('/categories/:id', authenticateUser, authorizeAdmin, removeCategory)

router.get('/items', getMenuItems)
router.get('/items/:id', getMenuItem)
router.post('/items', authenticateUser, authorizeAdmin, uploadMenuImage, postMenuItem)
router.put('/items/:id', authenticateUser, authorizeAdmin, uploadMenuImage, putMenuItem)
router.delete('/items/:id', authenticateUser, authorizeAdmin, removeMenuItem)

export default router
