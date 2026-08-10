import { EditProfileForm } from '@/features/profile/components/EditProfileForm'
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm'
import { ProfileHero } from '@/features/profile/components/ProfileHero'
import { ProfileStatistics } from '@/features/profile/components/ProfileStatistics'
import { ProfileSecurityCard } from '@/features/profile/components/ProfileSecurityCard'

/**
 * The full profile page content (UI-09), shared by all three role
 * wrappers — MyProfilePage (Customer), dashboard/profile/ProfilePage
 * (Admin), and the same ProfilePage reused at /staff/profile (Staff,
 * from UI-07). One body, three different chrome shells, exactly the
 * pattern used throughout this project (CustomerShell/StaffShell/
 * DashboardLayout wrapping otherwise-identical page content).
 */
export function ProfileBody({ user, actions }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <ProfileHero user={user} />

      <ProfileStatistics user={user} />

      <EditProfileForm
        user={user}
        onSubmit={actions.saveProfile}
        isSubmitting={actions.isSavingProfile}
        errors={actions.profileErrors}
        successMessage={actions.profileSuccess}
      />

      <div id="change-password">
        <ChangePasswordForm
          onSubmit={actions.submitPasswordChange}
          isSubmitting={actions.isChangingPassword}
          errors={actions.passwordErrors}
          successMessage={actions.passwordSuccess}
        />
      </div>

      <ProfileSecurityCard user={user} />
    </div>
  )
}
