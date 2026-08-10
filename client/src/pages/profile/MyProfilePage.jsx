import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileBody } from '@/features/profile/components/ProfileBody'
import { useProfileActions } from '@/features/profile/hooks/useProfileActions'
import { ROUTES } from '@/constants'

/**
 * Customer's profile page (UI-09 redesign). Top-level, any authenticated
 * role reaches this same route — but in practice only Customer lands
 * here directly (Admin/Staff have their own dashboard chrome around the
 * identical ProfileBody). Same shape as MyOrdersPage/MyBillsPage: a
 * simple header, no dashboard chrome.
 */
export default function MyProfilePage() {
  const { user } = useAuth()
  const actions = useProfileActions()

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
        <Link
          to={ROUTES.ACCOUNT}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-body-muted transition-colors hover:text-brand-700 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <ProfileBody user={user} actions={actions} />
      </div>
    </div>
  )
}
