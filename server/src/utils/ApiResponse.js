/**
 * Every successful endpoint responds with this same shape, so the frontend
 * never has to guess whether data is at the top level or under `.data`.
 *   { success: true, message, data }
 */
export function sendSuccess(res, { statusCode = 200, message = 'Success', data = null } = {}) {
  return res.status(statusCode).json({ success: true, message, data })
}
