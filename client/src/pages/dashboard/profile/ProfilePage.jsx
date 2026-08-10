import { useAuth } from '@/hooks/useAuth'
import { ProfileBody } from '@/features/profile/components/ProfileBody'
import { useProfileActions } from '@/features/profile/hooks/useProfileActions'

/**
 * Admin/Staff profile page (UI-09 redesign). Reached via ProfileDropdown
 * while already inside DashboardLayout (Admin, at /dashboard/profile) or
 * StaffLayout (Staff, at /staff/profile — wired in UI-07). No page-level
 * chrome here: whichever dashboard shell is active already frames it.
 */
export default function ProfilePage() {
  const { user } = useAuth()
  const actions = useProfileActions()

  return <ProfileBody user={user} actions={actions} />
}
