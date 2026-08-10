/**
 * Client-side search/filter/sort for Admin Reservation Management
 * (UI-08.5).
 *
 * GET /reservations takes no query parameters — listReservations in
 * reservation.service.js returns every reservation for Admin, in
 * whatever order Prisma's default returns them, full stop. Every filter
 * the spec asks for is therefore applied here, against the one full
 * result set useReservations already fetches.
 */

export const RESERVATION_STATUS_FILTERS = [
  { value: '', label: 'Any status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const DATE_FILTERS = [
  { value: '', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

export const GUEST_FILTERS = [
  { value: '', label: 'Any party size' },
  { value: '1-2', label: '1–2 guests' },
  { value: '3-4', label: '3–4 guests' },
  { value: '5+', label: '5+ guests' },
]

export const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Date (soonest first)' },
  { value: 'newest-booked', label: 'Newest booked' },
  { value: 'oldest-booked', label: 'Oldest booked' },
  { value: 'guests-desc', label: 'Guests (most first)' },
]

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function matchesDate(reservation, dateFilter) {
  if (!dateFilter) return true
  const day = new Date(reservation.reservationDate)
  const today = startOfToday()
  if (dateFilter === 'today') return day.getTime() === today.getTime()
  if (dateFilter === 'upcoming') return day.getTime() >= today.getTime()
  return day.getTime() < today.getTime() // past
}

function matchesGuests(reservation, guestFilter) {
  if (!guestFilter) return true
  const count = reservation.guestCount
  if (guestFilter === '1-2') return count >= 1 && count <= 2
  if (guestFilter === '3-4') return count >= 3 && count <= 4
  return count >= 5 // '5+'
}

/**
 * Search matches customer name and phone number — the two fields the
 * search bar advertises, and the two an admin would realistically type
 * when someone calls to ask about their booking.
 */
export function filterReservations(reservations, { search, status, date, guests, tableId }) {
  const query = search.trim().toLowerCase()

  return reservations.filter((reservation) => {
    if (query) {
      const matchesQuery =
        reservation.customerName.toLowerCase().includes(query) || reservation.customerPhone.includes(query)
      if (!matchesQuery) return false
    }
    if (status && reservation.status !== status) return false
    if (tableId && reservation.tableId !== tableId) return false
    if (!matchesDate(reservation, date)) return false
    if (!matchesGuests(reservation, guests)) return false
    return true
  })
}

function dateTimeValue(reservation) {
  // reservationDate is a bare date; reservationTime is "HH:mm" — combined
  // for a real chronological sort rather than sorting by date alone,
  // which would leave same-day reservations in arbitrary order.
  const [hours, minutes] = String(reservation.reservationTime).split(':').map(Number)
  const date = new Date(reservation.reservationDate)
  date.setHours(hours || 0, minutes || 0, 0, 0)
  return date.getTime()
}

export function sortReservations(reservations, sortBy) {
  const list = [...reservations]
  if (sortBy === 'newest-booked') return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy === 'oldest-booked') return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  if (sortBy === 'guests-desc') return list.sort((a, b) => b.guestCount - a.guestCount)
  return list.sort((a, b) => dateTimeValue(a) - dateTimeValue(b)) // upcoming (soonest first)
}
