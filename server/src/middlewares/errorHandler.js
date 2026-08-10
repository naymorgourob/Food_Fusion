import multer from 'multer'
import { Prisma } from '../generated/prisma/client.ts'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

// Translates a couple of well-known non-ApiError exception types into the
// same { statusCode, message } shape ApiError uses, so the rest of this
// file only has one branch to worry about. Anything not recognized here
// falls through to the generic 500 below.
function normalizeKnownError(err) {
  if (err instanceof ApiError) return { statusCode: err.statusCode, message: err.message, details: err.details }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2MB or smaller.' : `Upload failed: ${err.message}`
    return { statusCode: 400, message, details: null }
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 (unique constraint) is already caught up front in the service
    // layer for a specific message — this is only a safety net for a race
    // condition slipping past that check.
    if (err.code === 'P2002') return { statusCode: 409, message: 'That value is already in use.', details: null }
    if (err.code === 'P2025') return { statusCode: 404, message: 'Record not found.', details: null }
    // P2003: the onDelete: Restrict guard on Food.category firing directly
    // at the database level, in case the application-level check in
    // category.service.js is ever bypassed.
    if (err.code === 'P2003') {
      return { statusCode: 409, message: 'This record is still referenced by other data.', details: null }
    }
  }

  return null
}

/**
 * The single place every error in the app funnels through. Express 5
 * forwards rejected promises from async route handlers here automatically,
 * so controllers never need a try/catch or a wrapAsync helper just to
 * report a failure — they just `throw new ApiError(...)`.
 *
 * Must be registered last, and must keep all four parameters (that's how
 * Express recognizes error-handling middleware).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const known = normalizeKnownError(err)
  const statusCode = known?.statusCode ?? 500
  const message = known?.message ?? 'Something went wrong on our end.'

  if (!known) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: known?.details ?? null,
    ...(env.nodeEnv === 'development' && !known ? { stack: err.stack } : {}),
  })
}
