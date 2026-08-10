import {
  getDashboardStats,
  getOrdersSummary,
  getReservationsSummary,
  getRevenueSummary,
} from '../services/report.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'

export async function getDashboardStatsHandler(req, res) {
  const stats = await getDashboardStats()
  sendSuccess(res, { message: 'Dashboard statistics fetched successfully.', data: { stats } })
}

export async function getOrdersSummaryHandler(req, res) {
  const summary = await getOrdersSummary(req.query)
  sendSuccess(res, { message: 'Order summary fetched successfully.', data: { summary } })
}

export async function getReservationsSummaryHandler(req, res) {
  const summary = await getReservationsSummary(req.query)
  sendSuccess(res, { message: 'Reservation summary fetched successfully.', data: { summary } })
}

export async function getRevenueSummaryHandler(req, res) {
  const summary = await getRevenueSummary(req.query)
  sendSuccess(res, { message: 'Revenue summary fetched successfully.', data: { summary } })
}
