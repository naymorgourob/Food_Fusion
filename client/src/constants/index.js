export const APP_NAME = 'FoodFusion'

// The API returns image paths as server-relative ("/uploads/menu/x.jpg"),
// not full URLs — VITE_API_BASE_URL includes the "/api/v1" suffix, so the
// origin has to be derived by stripping it, once, here.
export const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin

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
  BILLS: '/bills',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOYALTY: '/loyalty',
  FAVORITES: '/favorites',
  UNAUTHORIZED: '/unauthorized',
  // Staff's own workspace (UI-07) — separate from the Admin dashboard's
  // /dashboard/* routes so Admin's shell (Sidebar, DashboardLayout) never
  // has to change to accommodate Staff's redesign.
  STAFF_HOME: '/staff',
  STAFF_KITCHEN: '/staff/kitchen',
  STAFF_ORDERS: '/staff/orders',
  STAFF_RESERVATIONS: '/staff/reservations',
  STAFF_TABLES: '/staff/tables',
  STAFF_PROFILE: '/staff/profile',
  STAFF_SETTINGS: '/staff/settings',
}

// Where a just-logged-in user lands: the real Admin Dashboard for Admins,
// Staff's own workspace for Staff, and /account (the full shell) for
// Customer.
export function getHomeRouteForRole(role) {
  if (role === USER_ROLES.ADMIN) return ROUTES.DASHBOARD
  if (role === USER_ROLES.STAFF) return ROUTES.STAFF_HOME
  return ROUTES.ACCOUNT
}
