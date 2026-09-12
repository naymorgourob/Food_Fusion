import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getStaffWorkspace, STAFF_WORKSPACES } from '@/utils/staffWorkspace'
import { ROUTES } from '@/constants'

/**
 * Guard that ensures a staff user can only access their authorized workspace:
 * - Chefs are confined to Chef Workspace (/staff/chef/*)
 * - Waiters are confined to Waiter Workspace (/staff/waiter/*)
 * Cross-workspace access attempts are automatically redirected with replace.
 */
export function StaffPositionGuard({ allowedWorkspace, children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const currentWorkspace = getStaffWorkspace(user)

  if (currentWorkspace !== allowedWorkspace) {
    const redirectPath =
      currentWorkspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_HOME : ROUTES.WAITER_HOME
    return <Navigate to={redirectPath} replace />
  }

  return children || <Outlet />
}

