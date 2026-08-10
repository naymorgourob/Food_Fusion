/**
 * Thrown deliberately by controllers/middleware for anything that isn't a
 * plain 200 (validation failure, not found, unauthorized...). The global
 * error handler in middlewares/errorHandler.js knows how to turn one of
 * these into the standard error response shape; anything else it treats as
 * an unexpected bug and responds with a generic 500.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}
