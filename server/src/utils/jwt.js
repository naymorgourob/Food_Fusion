import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// The only two places the secret and expiry are referenced — everything
// else just calls these two functions.
export function generateToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

// Throws jwt.TokenExpiredError or jwt.JsonWebTokenError on failure — the
// authenticateUser middleware is what turns those into a proper 401.
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret)
}
