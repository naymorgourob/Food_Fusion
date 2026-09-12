import { Navigate, useOutletContext } from 'react-router-dom'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { Skeleton } from '@/components/customer/ui'
import { ROUTES } from '@/constants'

const ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'])

export default function TrackOrderRedirect() {
  const outlet = useOutletContext()
  const localOrders = useOrders()
  const { orders = [], isLoading } = outlet?.orders || localOrders

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <span className="sr-only">Locating your order…</span>
      </div>
    )
  }

  // 1. Find the current active order (newest first, since orders are sorted by createdAt desc)
  const activeOrder = orders.find((order) => ACTIVE_STATUSES.has(order.status))
  if (activeOrder) {
    return <Navigate to={`${ROUTES.ORDERS}/${activeOrder.id}`} replace />
  }

  // 2. If no active order exists, fall back to the most recent completed/past order
  if (orders.length > 0) {
    return <Navigate to={`${ROUTES.ORDERS}/${orders[0].id}`} replace />
  }

  // 3. If the customer has never placed any order, navigate to My Orders
  return <Navigate to={ROUTES.ORDERS} replace />
}

