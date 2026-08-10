import { ClipboardList, CalendarCheck, Sparkles, Heart, ChefHat, Users, Receipt } from 'lucide-react'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useReservations } from '@/features/reservations/hooks/useReservations'
import { useLoyalty } from '@/features/loyalty/hooks/useLoyalty'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { USER_ROLES } from '@/constants'

function StatCard({ icon: Icon, label, value, isLoading }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-rule bg-card p-4">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="flex min-w-0 flex-col">
        {isLoading ? (
          <span className="skeleton h-6 w-10 rounded" aria-hidden />
        ) : (
          <span className="font-display text-xl font-semibold text-body">{value}</span>
        )}
        <span className="text-xs leading-tight font-medium text-body-faint">{label}</span>
      </div>
    </div>
  )
}

/**
 * Profile Statistics (UI-09) — real counts only, computed from data the
 * signed-in role can already fetch. Every number here is a real read: no
 * new endpoint was added for this component.
 *
 * Per-role scope, decided by what's genuinely available:
 *
 *   Customer: order count, reservation count, loyalty points (from the
 *   existing loyalty summary), favourite dishes count.
 *
 *   Staff: orders they're personally assigned to (assignedOrders is a
 *   real relation), split into completed vs. still active. "Performance"
 *   was requested but there is no rating/review/performance-score model
 *   anywhere in the schema, so it's not shown rather than invented.
 *
 *   Admin: total customers and total orders system-wide — both already
 *   fetchable (GET /orders returns everything for Admin; GET /customers
 *   list length gives the count) without calling the admin-only
 *   dashboard-stats report endpoint this page has no reason to duplicate.
 *   "Revenue" is intentionally absent here — Admin already has the real
 *   Reports page with the actual revenue-summary endpoint; repeating a
 *   money figure on the profile page from a second, less precise source
 *   (order totals rather than paid bills) would just create two revenue
 *   numbers that could disagree.
 */
export function ProfileStatistics({ user }) {
  if (user.role === USER_ROLES.CUSTOMER) return <CustomerStats />
  if (user.role === USER_ROLES.STAFF) return <StaffStats user={user} />
  return <AdminStats />
}

function CustomerStats() {
  const { orders, isLoading: ordersLoading } = useOrders()
  const { reservations, isLoading: reservationsLoading } = useReservations()
  const { summary, isLoading: loyaltyLoading } = useLoyalty()
  const { favorites, isLoading: favoritesLoading } = useFavorites()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={ClipboardList} label="Orders placed" value={orders.length} isLoading={ordersLoading} />
      <StatCard
        icon={CalendarCheck}
        label="Reservations made"
        value={reservations.length}
        isLoading={reservationsLoading}
      />
      <StatCard
        icon={Sparkles}
        label="Loyalty points"
        value={summary?.currentPoints ?? 0}
        isLoading={loyaltyLoading}
      />
      <StatCard icon={Heart} label="Favorite dishes" value={favorites.length} isLoading={favoritesLoading} />
    </div>
  )
}

function StaffStats({ user }) {
  const { orders, isLoading } = useOrders()
  const assigned = orders.filter((order) => order.assignedStaff?.id === user.id)
  const completed = assigned.filter((order) => order.status === 'COMPLETED').length
  const active = assigned.filter((order) => !['COMPLETED', 'CANCELLED'].includes(order.status)).length

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard icon={Receipt} label="Assigned to you" value={assigned.length} isLoading={isLoading} />
      <StatCard icon={ChefHat} label="Completed" value={completed} isLoading={isLoading} />
      <StatCard icon={ClipboardList} label="Currently active" value={active} isLoading={isLoading} />
    </div>
  )
}

function AdminStats() {
  const { orders, isLoading } = useOrders()
  const customerCount = new Set(orders.map((order) => order.customer.id)).size

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      <StatCard icon={ClipboardList} label="Total orders" value={orders.length} isLoading={isLoading} />
      <StatCard icon={Users} label="Customers served" value={customerCount} isLoading={isLoading} />
    </div>
  )
}
