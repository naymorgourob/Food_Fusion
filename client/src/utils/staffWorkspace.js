import { ROUTES } from '../constants/index.js'

export const STAFF_WORKSPACES = {
  CHEF: 'chef',
  WAITER: 'waiter',
}

/**
 * Checks if a staff member's position is kitchen/culinary-related.
 * Matches: Chef, Head Chef, Line Cook, Sous Chef, Kitchen Staff, Baker, Pastry Chef, etc.
 */
export function isChefPosition(position = '') {
  const pos = String(position).toLowerCase().trim()
  return (
    pos.includes('chef') ||
    pos.includes('cook') ||
    pos.includes('kitchen') ||
    pos.includes('baker') ||
    pos.includes('pastry') ||
    pos.includes('culinary')
  )
}

/**
 * Checks if a staff member's position is front-of-house/dining-floor-related.
 * Matches: Waiter, Head Waiter, Server, Host, Floor Staff, Busser, Runner, Sommelier, etc.
 */
export function isWaiterPosition(position = '') {
  const pos = String(position).toLowerCase().trim()
  return (
    pos.includes('wait') ||
    pos.includes('server') ||
    pos.includes('floor') ||
    pos.includes('service') ||
    pos.includes('host') ||
    pos.includes('steward') ||
    pos.includes('busser') ||
    pos.includes('runner') ||
    pos.includes('sommelier')
  )
}

/**
 * Resolves the appropriate workspace identifier for a staff user.
 * Defaults to 'chef' if position is culinary; otherwise 'waiter'.
 */
export function getStaffWorkspace(user) {
  if (!user) return STAFF_WORKSPACES.WAITER
  if (isChefPosition(user.position)) return STAFF_WORKSPACES.CHEF
  return STAFF_WORKSPACES.WAITER
}

/**
 * Returns the default landing path for a staff user.
 */
export function getStaffHomeRoute(user) {
  const workspace = getStaffWorkspace(user)
  return workspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_HOME : ROUTES.WAITER_HOME
}
