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
export default function Account() {
  const { user } = useAuth()

  if (user?.role !== USER_ROLES.CUSTOMER) return <Navigate to={ROUTES.STAFF_HOME} replace />

  return <CustomerShell>{(context) => <CustomerDashboard context={context} />}</CustomerShell>
}
