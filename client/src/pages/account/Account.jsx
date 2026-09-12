import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, USER_ROLES } from '@/constants'
import { CustomerShell } from '@/layouts/CustomerLayout'
import { CustomerDashboard } from '@/pages/account/CustomerDashboard'

// Routed at /account for any authenticated non-Admin role — Admin lands on
// the real /dashboard instead (see getHomeRouteForRole).
//
// The role branch happens here rather than in the router because Customer
// and Staff share this path: gating the route to Customer would bounce
// Staff to /unauthorized. Customer gets the full shell (sidebar + top bar,
// UI-02). Staff now has its own workspace at /staff (UI-07) — this just
// redirects there, so an old bookmark or link to /account still lands
// somewhere real instead of the previous plain holding page.
import { getStaffHomeRoute } from '@/utils/staffWorkspace'

export default function Account() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  if (user.role === USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (user.role === USER_ROLES.STAFF) {
    return <Navigate to={getStaffHomeRoute(user)} replace />
  }

  return <CustomerShell>{(context) => <CustomerDashboard context={context} />}</CustomerShell>
}
