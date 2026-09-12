import AccountSettingsPage from '@/pages/profile/AccountSettingsPage'
import { useAuth } from '@/hooks/useAuth'
import { isChefPosition } from '@/utils/staffWorkspace'
import { ROUTES } from '@/constants'

export default function StaffSettingsPage({ profilePath }) {
  const { user } = useAuth()
  const resolvedPath =
    profilePath || (isChefPosition(user?.position) ? ROUTES.CHEF_PROFILE : ROUTES.WAITER_PROFILE)

  return <AccountSettingsPage profilePath={resolvedPath} />
}

