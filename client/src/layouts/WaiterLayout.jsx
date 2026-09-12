import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { WaiterSidebar } from '@/components/staff/WaiterSidebar'
import { StaffTopBar } from '@/components/staff/StaffTopBar'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import { useTables } from '@/features/tables/hooks/useTables'
import { useStaffNotifications } from '@/features/notifications/useStaffNotifications'

const COLLAPSE_KEY = 'foodfusion-waiter-sidebar-collapsed'

export function WaiterShell({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const orders = useOrders()
  const reservations = useReservations()
  const tables = useTables()

  const notifications = useStaffNotifications({
    orders: orders.orders,
    reservations: reservations.reservations,
    tables: tables.tables,
    workspace: 'waiter',
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
      <WaiterSidebar
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
        <StaffTopBar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          notifications={notifications}
          workspace="waiter"
        />

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

export default function WaiterLayout() {
  return <WaiterShell>{(context) => <Outlet context={context} />}</WaiterShell>
}

