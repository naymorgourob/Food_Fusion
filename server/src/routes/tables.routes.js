import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import { getTables, postTable, putTable, removeTable } from '../controllers/table.controller.js'

const router = Router()

// GET loosened to any authenticated role in Part 11: a Customer booking a
// table via the reservation form needs to see what tables exist. Writes
// stay Admin-only. This is the exact revision flagged as likely back in
// Part 10 — a real consumer showed up, so the decision changed with it.
router.get('/', authenticateUser, getTables)
router.post('/', authenticateUser, authorizeAdmin, postTable)
router.put('/:id', authenticateUser, authorizeAdmin, putTable)
router.delete('/:id', authenticateUser, authorizeAdmin, removeTable)

export default router
