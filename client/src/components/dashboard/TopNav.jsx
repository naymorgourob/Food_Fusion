import { Menu, Search } from 'lucide-react'
import { Breadcrumb } from '@/components/dashboard/Breadcrumb'
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown'
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown'
import { useCurrentPageTitle } from '@/hooks/useCurrentPageTitle'

/**
 * Reused by every dashboard page via DashboardLayout — the page title and
 * breadcrumb change automatically per-route (see Breadcrumb.jsx), so no
 * future module needs to touch this file to appear correctly here.
 */
export function TopNav({ onOpenMobileSidebar }) {
  const title = useCurrentPageTitle()

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-none items-center gap-4 border-b border-border bg-paper/80 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onOpenMobileSidebar}
        aria-label="Open sidebar"
        className="text-ink lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-h4 font-semibold leading-tight text-ink">{title}</h1>
        <Breadcrumb />
      </div>

      <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 md:flex">
        <Search className="h-4 w-4 text-ink-faint" />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="w-40 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none lg:w-56"
        />
      </div>

      <NotificationDropdown />
      <ProfileDropdown />
    </header>
  )
}
