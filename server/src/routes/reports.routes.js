import { Router } from 'express'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import {
  getDashboardStatsHandler,
  getOrdersSummaryHandler,
  getReservationsSummaryHandler,
  getRevenueSummaryHandler,
} from '../controllers/report.controller.js'

const router = Router()

// Admin-only, per this part's Authorization section. Every report reads
// from tables built in earlier parts — no writes happen here at all.
router.get('/dashboard-stats', authenticateUser, authorizeAdmin, getDashboardStatsHandler)
router.get('/orders-summary', authenticateUser, authorizeAdmin, getOrdersSummaryHandler)
router.get('/reservations-summary', authenticateUser, authorizeAdmin, getReservationsSummaryHandler)
router.get('/revenue-summary', authenticateUser, authorizeAdmin, getRevenueSummaryHandler)

export default router
