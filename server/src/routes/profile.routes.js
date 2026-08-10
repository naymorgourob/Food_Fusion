import { Router } from 'express'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import { uploadProfileImage } from '../config/multer.js'
import { getMe, putProfile, putChangePassword } from '../controllers/profile.controller.js'

const router = Router()

// Any authenticated role (Admin, Staff, or Customer) can view and manage
// their own profile — that's why these only need authenticateUser, no
// role guard.
router.get('/me', authenticateUser, getMe)
router.put('/me', authenticateUser, uploadProfileImage, putProfile)
router.put('/me/password', authenticateUser, putChangePassword)

export default router
