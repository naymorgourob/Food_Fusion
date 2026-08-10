import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

/**
 * Gate for any route under DashboardLayout. `allowedRoles` is optional —
 * omit it to require only "logged in," or pass e.g. ["ADMIN"] to also
 * require a specific role. Two different failure reasons get two
 * different destinations: not logged in goes to Login (and remembers
 * where to return to), logged in but wrong role goes to Unauthorized.
 */
export function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null // brief — avoids a flash of the login page before hydration finishes

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}
