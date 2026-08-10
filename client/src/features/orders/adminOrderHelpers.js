/**
 * Client-side search/filter/sort for Admin Order Management (UI-08.4).
 *
 * GET /orders takes no query parameters at all — no search, no status/
 * type/payment/date filter, no sort (see listOrders in
 * order.service.js: it returns everything for Admin/Staff, ordered by
 * createdAt desc, full stop). Every filter the spec asks for is
 * therefore applied here, against the one full result set useOrders
 * already fetches — not a new endpoint, and not a fabricated filter that
 * silently does nothing.
 */

export const ORDER_STATUS_FILTERS = [
  { value: '', label: 'Any status' },
  { value: 'PENDING', label: 'Placed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'ON_THE_WAY', label: 'On the Way' },
  { value: 'SERVED', label: 'Ready to Serve' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const ORDER_TYPE_FILTERS = [
  { value: '', label: 'Any type' },
  { value: 'DINE_IN', label: 'Dine-in' },
  { value: 'TAKEAWAY', label: 'Takeaway' },
  { value: 'DELIVERY', label: 'Delivery' },
]

// PAID/UNPAID mirror Bill.paymentStatus exactly (BillPaymentStatus has no
// other values — see UI-04's checkout audit). "No bill yet" is a real,
// distinct, and very common state — most orders in flight haven't been
// billed at all — so it gets its own filter option rather than being
// lumped in with UNPAID, which would conflate "hasn't been billed" with
// "was billed and is unpaid."
export const PAYMENT_STATUS_FILTERS = [
  { value: '', label: 'Any payment status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'NONE', label: 'No bill yet' },
]

export const DATE_FILTERS = [
  { value: '', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total-desc', label: 'Total (high to low)' },
  { value: 'total-asc', label: 'Total (low to high)' },
]

function paymentStatusOf(order) {
  if (!order.bill) return 'NONE'
  return order.bill.paymentStatus
}

function matchesDate(order, dateFilter) {
  if (!dateFilter) return true
  const created = new Date(order.createdAt).getTime()
  const now = Date.now()
  const days = dateFilter === 'today' ? 1 : dateFilter === '7d' ? 7 : 30
  const since = new Date().setHours(0, 0, 0, 0) - (days - 1) * 86400000
  return created >= since && created <= now
}

/**
 * Applies search + all four filters to the full order list. Search
 * matches order number and customer name — the same two fields the
 * search bar advertises, and the only two an admin can realistically
 * expect to type.
 */
export function filterOrders(orders, { search, status, orderType, paymentStatus, date }) {
  const query = search.trim().toLowerCase()

  return orders.filter((order) => {
    if (query) {
      const matchesQuery =
        String(order.orderNumber).includes(query) || order.customer.fullName.toLowerCase().includes(query)
      if (!matchesQuery) return false
    }
    if (status && order.status !== status) return false
    if (orderType && order.orderType !== orderType) return false
    if (paymentStatus && paymentStatusOf(order) !== paymentStatus) return false
    if (!matchesDate(order, date)) return false
    return true
  })
}

export function sortOrders(orders, sortBy, grandTotalOf) {
  const list = [...orders]
  if (sortBy === 'oldest') return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  if (sortBy === 'total-desc') return list.sort((a, b) => grandTotalOf(b) - grandTotalOf(a))
  if (sortBy === 'total-asc') return list.sort((a, b) => grandTotalOf(a) - grandTotalOf(b))
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest
}
