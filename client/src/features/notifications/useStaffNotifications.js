import { useMemo } from 'react'
import { ReceiptText, Utensils, BellRing, CalendarClock, AlertTriangle, AlertOctagon, Package } from 'lucide-react'
import { ROUTES } from '@/constants'
import { orderNo } from '@/utils/format'
import { priorityFor } from '@/features/orders/staffOrderHelpers'

export function useStaffNotifications({
  orders = [],
  reservations = [],
  tables = [],
  inventory = [],
  workspace = 'waiter',
}) {
  return useMemo(() => {
    const items = []

    if (workspace === 'chef') {
      // 1. High urgency / delayed kitchen orders
      for (const order of orders) {
        const priority = priorityFor(order)
        if (priority === 'high' && ['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
          items.push({
            id: `chef-order-urgent-${order.id}`,
            icon: AlertTriangle,
            tone: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500/20',
            title: 'Order Delayed / Urgent',
            description: `${orderNo(order.orderNumber)} requires immediate kitchen attention.`,
            to: `${ROUTES.CHEF_ORDERS}?tab=urgent`,
            at: new Date(order.updatedAt ?? order.createdAt).getTime() + 1000,
          })
        }

        // 2. New pending kitchen orders awaiting accept
        if (order.status === 'PENDING') {
          items.push({
            id: `chef-order-new-${order.id}`,
            icon: ReceiptText,
            tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20',
            title: 'New Order Received',
            description: `${orderNo(order.orderNumber)} from ${order.customer?.fullName ?? 'a guest'} is awaiting kitchen accept.`,
            to: `${ROUTES.CHEF_ORDERS}?tab=new`,
            at: new Date(order.createdAt).getTime(),
          })
        }

        // 3. Special preparation instructions
        if (order.specialInstructions && ['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
          items.push({
            id: `chef-order-special-${order.id}`,
            icon: Utensils,
            tone: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/20',
            title: 'Special Kitchen Instruction',
            description: `${orderNo(order.orderNumber)}: “${order.specialInstructions}”`,
            to: ROUTES.CHEF_ORDERS,
            at: new Date(order.updatedAt ?? order.createdAt).getTime(),
          })
        }
      }

      // 4. Critical inventory alerts (Chefs manage ingredient stock)
      for (const item of inventory) {
        if (item.status === 'OUT_OF_STOCK') {
          items.push({
            id: `chef-inv-oos-${item.id}`,
            icon: AlertOctagon,
            tone: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-1 ring-red-500/20',
            title: 'Out of Stock Ingredient',
            description: `${item.itemName} is completely depleted.`,
            to: `${ROUTES.CHEF_INVENTORY}?status=OUT_OF_STOCK`,
            at: new Date(item.updatedAt ?? item.createdAt).getTime() || Date.now(),
          })
        } else if (item.status === 'LOW_STOCK') {
          items.push({
            id: `chef-inv-low-${item.id}`,
            icon: Package,
            tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20',
            title: 'Low Stock Ingredient',
            description: `${item.itemName} (${Number(item.quantity)} ${item.unit} left) is below min threshold.`,
            to: `${ROUTES.CHEF_INVENTORY}?status=LOW_STOCK`,
            at: new Date(item.updatedAt ?? item.createdAt).getTime() || Date.now(),
          })
        }
      }
    } else {
      // WAITER WORKSPACE
      // 1. Ready Orders (Top priority for waiters — food waiting on the pass)
      for (const order of orders) {
        if (order.status === 'READY') {
          const tableLabel = order.table?.number ? `Table #${order.table.number}` : 'Takeaway'
          items.push({
            id: `waiter-order-ready-${order.id}`,
            icon: BellRing,
            tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-1 ring-emerald-500/30',
            title: 'Order Ready to Serve!',
            description: `${tableLabel} · ${orderNo(order.orderNumber)} is plated and ready for table delivery.`,
            to: `${ROUTES.WAITER_ORDERS}?tab=ready`,
            at: new Date(order.readyAt ?? order.updatedAt ?? order.createdAt).getTime() + 10000,
          })
        } else if (order.status === 'PENDING') {
          const tableLabel = order.table?.number ? `Table #${order.table.number}` : order.orderType
          items.push({
            id: `waiter-order-new-${order.id}`,
            icon: ReceiptText,
            tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/20',
            title: 'New order placed',
            description: `${orderNo(order.orderNumber)} for ${tableLabel} placed by ${order.customer?.fullName ?? 'guest'}.`,
            to: `${ROUTES.WAITER_ORDERS}?tab=new`,
            at: new Date(order.createdAt).getTime(),
          })
        }

        if (order.specialInstructions && ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status)) {
          items.push({
            id: `waiter-order-note-${order.id}`,
            icon: Utensils,
            tone: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/20',
            title: 'Customer Special Request',
            description: `${orderNo(order.orderNumber)}: “${order.specialInstructions}”`,
            to: ROUTES.WAITER_ORDERS,
            at: new Date(order.updatedAt ?? order.createdAt).getTime(),
          })
        }
      }

      // 2. Upcoming Reservations today
      const todayStr = new Date().toDateString()
      for (const res of reservations) {
        if (['PENDING', 'CONFIRMED'].includes(res.status)) {
          const isToday = new Date(res.reservationDate).toDateString() === todayStr
          if (isToday) {
            items.push({
              id: `waiter-res-today-${res.id}`,
              icon: CalendarClock,
              tone: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 ring-1 ring-blue-500/20',
              title: 'Upcoming Reservation Today',
              description: `${res.customerName} (${res.guestCount} guests) at ${res.reservationTime} · Table #${res.table?.number ?? 'TBD'}.`,
              to: ROUTES.WAITER_RESERVATIONS,
              at: new Date(res.createdAt).getTime(),
            })
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    return items.sort((a, b) => b.at - a.at).slice(0, 10)
  }, [orders, reservations, tables, inventory, workspace])
}
