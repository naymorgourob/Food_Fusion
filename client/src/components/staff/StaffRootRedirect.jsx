import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getStaffWorkspace, STAFF_WORKSPACES } from '@/utils/staffWorkspace'
import { ROUTES } from '@/constants'

/**
 * Handles incoming navigation to /staff and legacy /staff/* URLs,
 * dynamically routing to the user's specific workspace.
 */
export function StaffRootRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const workspace = getStaffWorkspace(user)
  return <Navigate to={workspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_HOME : ROUTES.WAITER_HOME} replace />
}

export function StaffOrdersRedirect() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const workspace = getStaffWorkspace(user)
  const targetBase = workspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_ORDERS : ROUTES.WAITER_ORDERS

  return <Navigate to={`${targetBase}${location.search}`} replace />
}

export function StaffProfileRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const workspace = getStaffWorkspace(user)
  return <Navigate to={workspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_PROFILE : ROUTES.WAITER_PROFILE} replace />
}

export function StaffSettingsRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  const workspace = getStaffWorkspace(user)
  return <Navigate to={workspace === STAFF_WORKSPACES.CHEF ? ROUTES.CHEF_SETTINGS : ROUTES.WAITER_SETTINGS} replace />
}

