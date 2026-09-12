import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ClipboardList, CalendarCheck, Boxes } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useClickOutside } from '@/hooks/useClickOutside'
import { fetchOrders } from '@/features/orders/services/orderService'
import { fetchReservations } from '@/features/reservations/services/reservationService'
import { fetchInventoryItems } from '@/features/inventory/services/inventoryService'
import { USER_ROLES } from '@/constants'

export function NotificationDropdown() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    let cancelled = false

    async function loadNotifications() {
      setIsLoading(true)
      try {
        const isAdmin = user?.role === USER_ROLES.ADMIN

        const [orders, reservations, inventory] = await Promise.all([
          fetchOrders().catch(() => []),
          fetchReservations().catch(() => []),
          isAdmin ? fetchInventoryItems().catch(() => []) : Promise.resolve([]),
        ])

        if (cancelled) return

        const items = []

        // 1. Pending orders
        const pendingOrders = orders.filter((o) => o.status === 'PENDING')
        if (pendingOrders.length > 0) {
          items.push({
            id: 'pending-orders',
            icon: ClipboardList,
            title: `${pendingOrders.length} New ${pendingOrders.length === 1 ? 'Order' : 'Orders'}`,
            description: 'Orders awaiting kitchen confirmation',
            to: '/dashboard/orders',
            tone: 'bg-ember-50 text-ember-600',
          })
        }

        // 2. Pending reservations
        const pendingReservations = reservations.filter((r) => r.status === 'PENDING')
        if (pendingReservations.length > 0) {
          items.push({
            id: 'pending-reservations',
            icon: CalendarCheck,
            title: `${pendingReservations.length} Pending ${pendingReservations.length === 1 ? 'Reservation' : 'Reservations'}`,
            description: 'Bookings awaiting confirmation',
            to: '/dashboard/reservations',
            tone: 'bg-warning-soft text-warning',
          })
        }

        // 3. Low or out of stock inventory items (Admin only)
        if (isAdmin) {
          const stockAlerts = inventory.filter(
            (item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK',
          )
          if (stockAlerts.length > 0) {
            items.push({
              id: 'inventory-alerts',
              icon: Boxes,
              title: `${stockAlerts.length} Inventory ${stockAlerts.length === 1 ? 'Alert' : 'Alerts'}`,
              description: 'Items running low or out of stock',
              to: '/dashboard/inventory',
              tone: 'bg-danger-soft text-danger',
            })
          }
        }

        setNotifications(items)
      } catch {
        if (!cancelled) setNotifications([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadNotifications()
    return () => {
      cancelled = true
    }
  }, [user?.role, open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember-600" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-2.5 px-2">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {notifications.length > 0 && (
              <span className="rounded-full bg-ember-50 px-2 py-0.5 text-xs font-semibold text-ember-600">
                {notifications.length} new
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-1.5 max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-muted">Checking alerts…</p>
            ) : notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">No new notifications.</p>
            ) : (
              notifications.map((notif) => {
                const Icon = notif.icon
                return (
                  <Link
                    key={notif.id}
                    to={notif.to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-surface-2"
                  >
                    <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg ${notif.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-xs font-semibold text-ink leading-tight">
                        {notif.title}
                      </span>
                      <span className="text-[11px] text-ink-muted leading-tight">
                        {notif.description}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
