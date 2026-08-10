import { Link } from 'react-router-dom'
import { useCurrentPageTitle } from '@/hooks/useCurrentPageTitle'
import { ROUTES } from '@/constants'

/**
 * Built entirely from React Router's route `handle.title` (set per-route in
 * App.jsx) via useMatches() — there's no hand-maintained breadcrumb state
 * to keep in sync. Every future module automatically gets a correct
 * breadcrumb just by setting `handle: { title }` on its route.
 */
export function Breadcrumb() {
  const title = useCurrentPageTitle()
  const isRoot = title === 'Dashboard'

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
      <Link to={ROUTES.DASHBOARD} className="hover:text-ink-muted">
        Dashboard
      </Link>
      {!isRoot && (
        <>
          <span aria-hidden="true">/</span>
          <span className="text-ink-muted">{title}</span>
        </>
      )}
    </nav>
  )
}
