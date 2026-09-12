export const APP_NAME = 'FoodFusion'

// The API returns image paths as server-relative ("/uploads/menu/x.jpg"),
// not full URLs — VITE_API_BASE_URL includes the "/api/v1" suffix, so the
// origin has to be derived by stripping it, once, here.
export const API_ORIGIN = new URL(import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api/v1').origin

export function getImageUrl(imagePath) {
  return imagePath ? `${API_ORIGIN}${imagePath}` : null
}

// Mirrors the UserRole enum in server/prisma/schema.prisma. Kept here as the
// single frontend source of truth so role checks never compare against a
// typo'd string literal scattered across the codebase.
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  // Both UI-only (UI-09) — there is no forgot/reset-password backend, only
  // POST /register and POST /login. See ForgotPasswordPage.jsx for what
  // that means for these two routes' behaviour.
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ACCOUNT: '/account',
  RESERVATIONS: '/reservations',
  ORDERS: '/orders',
  TRACK_ORDER: '/orders/track',
  BILLS: '/bills',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOYALTY: '/loyalty',
  FAVORITES: '/favorites',
  UNAUTHORIZED: '/unauthorized',
  // Staff's workspaces (separated into Chef and Waiter)
  STAFF_HOME: '/staff',
  // Chef workspace routes
  CHEF_HOME: '/staff/chef',
  CHEF_ORDERS: '/staff/chef/orders',
  CHEF_INVENTORY: '/staff/chef/inventory',
  CHEF_PROFILE: '/staff/chef/profile',
  CHEF_SETTINGS: '/staff/chef/settings',
  // Waiter workspace routes
  WAITER_HOME: '/staff/waiter',
  WAITER_ORDERS: '/staff/waiter/orders',
  WAITER_TABLES: '/staff/waiter/tables',
  WAITER_RESERVATIONS: '/staff/waiter/reservations',
  WAITER_PROFILE: '/staff/waiter/profile',
  WAITER_SETTINGS: '/staff/waiter/settings',
  // Legacy aliases
  STAFF_KITCHEN: '/staff/kitchen',
  STAFF_ORDERS: '/staff/orders',
  STAFF_INVENTORY: '/staff/inventory',
  STAFF_RESERVATIONS: '/staff/reservations',
  STAFF_TABLES: '/staff/tables',
  STAFF_PROFILE: '/staff/profile',
  STAFF_SETTINGS: '/staff/settings',
}

// Where a just-logged-in user lands: the real Admin Dashboard for Admins,
// the appropriate workspace for Staff based on user position, and /account
// for Customer.
export function getHomeRouteForRole(role, user) {
  if (role === USER_ROLES.ADMIN) return ROUTES.DASHBOARD
  if (role === USER_ROLES.STAFF) {
    if (user) {
      const pos = String(user.position || '').toLowerCase().trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return isChef ? ROUTES.CHEF_HOME : ROUTES.WAITER_HOME
    }
    return ROUTES.STAFF_HOME
  }
  return ROUTES.ACCOUNT
}

/**
 * Validates whether an authenticated user with a specific role and position
 * has permission to navigate to the specified path.
 * Used during login redirects to prevent bouncing unauthorized roles into guarded routes.
 */
export function canAccessPath(pathname, role, user) {
  if (!pathname || typeof pathname !== 'string') return false
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'

  // Never redirect to auth or error routes
  if (
    cleanPath === ROUTES.LOGIN ||
    cleanPath === ROUTES.REGISTER ||
    cleanPath === ROUTES.FORGOT_PASSWORD ||
    cleanPath === ROUTES.RESET_PASSWORD ||
    cleanPath === ROUTES.UNAUTHORIZED ||
    cleanPath === ''
  ) {
    return false
  }

  // Public landing page
  if (cleanPath === ROUTES.HOME) {
    return true
  }

  // Admin-only routes
  if (
    cleanPath === '/dashboard' ||
    cleanPath.startsWith('/dashboard/menu') ||
    cleanPath.startsWith('/dashboard/categories') ||
    cleanPath.startsWith('/dashboard/tables') ||
    cleanPath.startsWith('/dashboard/reservations') ||
    cleanPath.startsWith('/dashboard/customers') ||
    cleanPath.startsWith('/dashboard/staff') ||
    cleanPath.startsWith('/dashboard/inventory') ||
    cleanPath.startsWith('/dashboard/reports') ||
    cleanPath.startsWith('/dashboard/settings')
  ) {
    return role === USER_ROLES.ADMIN
  }

  // Shared Admin & Staff dashboard routes
  if (
    cleanPath.startsWith('/dashboard/orders') ||
    cleanPath.startsWith('/dashboard/billing') ||
    cleanPath.startsWith('/dashboard/profile')
  ) {
    return role === USER_ROLES.ADMIN || role === USER_ROLES.STAFF
  }

  // Staff routes
  if (cleanPath.startsWith('/staff')) {
    if (role !== USER_ROLES.STAFF) return false
    if (cleanPath.startsWith('/staff/chef')) {
      const pos = String(user?.position || '').toLowerCase().trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return isChef
    }
    if (cleanPath.startsWith('/staff/waiter')) {
      const pos = String(user?.position || '').toLowerCase().trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return !isChef
    }
    return true
  }

  // Customer-only routes
  if (
    cleanPath.startsWith('/orders') ||
    cleanPath.startsWith('/track-order') ||
    cleanPath.startsWith('/reservations') ||
    cleanPath.startsWith('/bills') ||
    cleanPath.startsWith('/loyalty') ||
    cleanPath.startsWith('/favorites')
  ) {
    return role === USER_ROLES.CUSTOMER
  }

  // Customer account page
  if (cleanPath === '/account') {
    return role === USER_ROLES.CUSTOMER
  }

  // Profile and settings are accessible to authenticated users
  if (cleanPath === '/profile' || cleanPath === '/settings') {
    return true
  }

  return false
}

