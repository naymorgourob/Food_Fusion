import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StaffSidebar } from '@/components/staff/StaffSidebar'
import { StaffTopBar } from '@/components/staff/StaffTopBar'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import { useTables } from '@/features/tables/hooks/useTables'
import { useStaffNotifications } from '@/features/notifications/useStaffNotifications'

const COLLAPSE_KEY = 'foodfusion-staff-sidebar-collapsed'

/**
 * Chrome for Staff's workspace (UI-07): emerald sidebar + glass top bar,
 * matching the visual system UI-02/03/04/05/06 established for Customer,
 * but populated with operational data instead of dining data.
 *
 * A separate layout from DashboardLayout on purpose — Admin's dashboard
 * (Sidebar.jsx, TopNav.jsx, DashboardFooter.jsx) is untouched by this
 * task. Staff's /dashboard/orders, /dashboard/billing, and
 * /dashboard/profile routes still exist and still work exactly as
 * before; this gives Staff an additional, better home at /staff/*.
 *
 * Orders, reservations, and tables are fetched once here (not per-page)
 * for the same reason CustomerShell centralised its three hooks — every
 * staff page needs at least one of these, and the KPI cards on the
 * Dashboard need all three.
 */
export function StaffShell({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const orders = useOrders()
  const reservations = useReservations()
  const tables = useTables()

  const notifications = useStaffNotifications({
    orders: orders.orders,
    reservations: reservations.reservations,
  })

  const context = { orders, reservations, tables }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem(COLLAPSE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <StaffSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-[5.25rem]' : 'lg:pl-64'
        }`}
      >
        <StaffTopBar onOpenMobileSidebar={() => setMobileOpen(true)} notifications={notifications} />

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {typeof children === 'function' ? children(context) : children}
        </motion.main>
      </div>
    </div>
  )
}

/** Route-layout form: renders the matched child route inside the shell. */
export default function StaffLayout() {
  return <StaffShell>{(context) => <Outlet context={context} />}</StaffShell>
}
