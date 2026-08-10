import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopNav } from '@/components/dashboard/TopNav'
import { DashboardFooter } from '@/components/dashboard/DashboardFooter'

const COLLAPSE_STORAGE_KEY = 'foodfusion-sidebar-collapsed'

/**
 * Chrome for the Admin Dashboard: Sidebar + TopNav + content + Footer.
 * Owns the sidebar's collapsed/mobile-open state here, at the top, since
 * both Sidebar (renders itself accordingly) and TopNav (has the button that
 * opens it on mobile) need to read and change it — passing it down as
 * props is simpler than a context for two consumers.
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-all duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <TopNav onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  )
}
