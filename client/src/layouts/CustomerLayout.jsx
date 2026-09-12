import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CustomerSidebar } from '@/components/customer/CustomerSidebar'
import { CustomerTopBar } from '@/components/customer/CustomerTopBar'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import { useLoyalty } from '@/features/loyalty/hooks/useLoyalty'
import { useCustomerNotifications } from '@/features/notifications/useCustomerNotifications'

const COLLAPSE_KEY = 'foodfusion-customer-sidebar-collapsed'

// Matches OrderProgressTracker's flow — everything short of a terminal
// state is still "in progress" for the customer.
const ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'])

/**
 * Chrome for every customer page: emerald sidebar + glass top bar.
 *
 * Two entry points on purpose:
 *   - As a route `element`, it renders <Outlet /> and passes the three
 *     shared hook results down as Outlet context.
 *   - As <CustomerShell>{children}</CustomerShell>, for pages that can't
 *     live under the Customer-gated route branch because Staff shares the
 *     path (/account, /profile). Those pass a render function to receive
 *     the same data.
 *
 * The three hooks are called HERE, once. Previously each page fetched its
 * own copy, so navigating between Dashboard, Orders, and Loyalty refetched
 * the same three endpoints every time.
 */
export function CustomerShell({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const orders = useOrders()
  const reservations = useReservations()
  const loyalty = useLoyalty()

  const notifications = useCustomerNotifications({
    orders: orders.orders,
    reservations: reservations.reservations,
    loyaltySummary: loyalty.summary,
  })

  const activeCount = orders.orders.filter((order) => ACTIVE_STATUSES.has(order.status)).length
  const context = { orders, reservations, loyalty }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem(COLLAPSE_KEY, String(next))
      return next
    })
  }

  const activeOrder = orders.orders.find((order) => ACTIVE_STATUSES.has(order.status))
  const activeOrderId = activeOrder?.id || orders.orders[0]?.id || null

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <CustomerSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activeOrderId={activeOrderId}
      />

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-[5.25rem]' : 'lg:pl-64'
        }`}
      >
        <CustomerTopBar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          notifications={notifications}
          cartCount={activeCount}
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

/** Route-layout form: renders the matched child route inside the shell. */
export default function CustomerLayout() {
  return <CustomerShell>{(context) => <Outlet context={context} />}</CustomerShell>
}
