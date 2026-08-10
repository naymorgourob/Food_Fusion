import AccountSettingsPage from '@/pages/profile/AccountSettingsPage'
import { ROUTES } from '@/constants'

// Staff's account settings (UI-09) at /staff/settings — reuses the exact
// same AccountSettingsPage Customer gets at /settings. It has no
// dependency on CustomerLayout/Outlet context (theme + localStorage
// preferences only), so nothing about it needs to differ for Staff
// beyond pointing "back to profile" at /staff/profile instead of the
// Customer-only /profile.
export default function StaffSettingsPage() {
  return <AccountSettingsPage profilePath={ROUTES.STAFF_PROFILE} />
}
