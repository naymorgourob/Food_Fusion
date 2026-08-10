import { getLoyaltySummary, listTransactions } from '../services/loyalty.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'

// Both endpoints read req.user.id directly — a Customer can only ever see
// their own loyalty data, with no id parameter to tamper with.
export async function getMyLoyalty(req, res) {
  const summary = await getLoyaltySummary(req.user.id)
  sendSuccess(res, { message: 'Loyalty summary fetched successfully.', data: { summary } })
}

export async function getMyTransactions(req, res) {
  const transactions = await listTransactions(req.user.id)
  sendSuccess(res, { message: 'Point history fetched successfully.', data: { transactions } })
}
