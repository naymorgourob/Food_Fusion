import { ApiError } from '../utils/ApiError.js'

// Placed after every mounted route — anything that reaches this point
// didn't match any known endpoint.
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}
