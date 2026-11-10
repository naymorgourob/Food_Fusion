import jwt from 'jsonwebtoken'
import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { getRestaurantStatus, closedMessage } from '../services/restaurantStatus.service.js'

/**
 * Verifies the request carries a valid, unexpired JWT. On success attaches
 * `req.user = { id, role }` (exactly what was signed into the token —
 * see utils/jwt.js) for every later middleware/controller to read.
 *
 * Every protected route needs this first — authorize* below only checks
 * *which* role is allowed, it never checks *whether* the caller is signed
 * in at all.
 */
export function authenticateUser(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Please log in.')
  }

  const token = header.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Your session has expired. Please log in again.')
    }
    throw new ApiError(401, 'Invalid authentication token.')
  }
}

/**
 * Shared by the three role-specific exports below so the "is this role
 * allowed" check is written once, not copy-pasted three times. Must run
 * after authenticateUser, since it reads req.user.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.')
    }
    next()
  }
}

export const authorizeAdmin = authorizeRoles('ADMIN')
export const authorizeStaff = authorizeRoles('STAFF')
export const authorizeCustomer = authorizeRoles('CUSTOMER')
// First feature (Order Management, Part 12) where Staff needs the same
// write access as Admin on a single route — a combined export instead of
// stacking two single-role checks on the route.
export const authorizeStaffOrAdmin = authorizeRoles('ADMIN', 'STAFF')

/**
 * Blocks order work (placing, accepting, updating) while the restaurant is
 * closed. Admin is never blocked, so they can still fix things after hours.
 * Must run after authenticateUser.
 */
export async function requireRestaurantOpen(req, res, next) {
  if (req.user.role === 'ADMIN') return next()
  const status = await getRestaurantStatus()
  if (!status.isOpen) throw new ApiError(409, closedMessage(status))
  next()
}
