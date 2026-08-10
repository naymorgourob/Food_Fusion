import { Router } from 'express'
import { authenticateUser, authorizeCustomer } from '../middlewares/auth.middleware.js'
import { getFavorites, postFavorite, removeFavoriteHandler } from '../controllers/favorite.controller.js'

const router = Router()

// Customer-only, and every handler scopes to req.user.id — a customer can
// only ever read or change their own favorites.
router.get('/', authenticateUser, authorizeCustomer, getFavorites)
router.post('/', authenticateUser, authorizeCustomer, postFavorite)
// Keyed by menuItemId, not the join row's own id — the client already
// knows which food it's un-favouriting, and shouldn't have to look up a
// join id first.
router.delete('/:menuItemId', authenticateUser, authorizeCustomer, removeFavoriteHandler)

export default router
