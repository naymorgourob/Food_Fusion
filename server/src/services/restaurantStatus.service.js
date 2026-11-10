import { prisma } from '../config/prisma.js'
import { getSettings } from './settings.service.js'
import { ApiError } from '../utils/ApiError.js'

// Opening hours are always read on the restaurant's own clock, not the
// server's: Render runs in UTC, six hours behind Dhaka, so new Date()'s
// local hours would open the restaurant at 5 PM.
export const RESTAURANT_TIME_ZONE = 'Asia/Dhaka'

const clockFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: RESTAURANT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// Today's date (YYYY-MM-DD) and minutes since midnight, in restaurant time.
export function restaurantClock(now = new Date()) {
  const parts = Object.fromEntries(
    clockFormatter.formatToParts(now).map((part) => [part.type, part.value]),
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

export function toMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number)
  return hours * 60 + minutes
}

// "23:00" -> "11:00 PM", for messages shown to customers and staff.
function formatTime(time) {
  const [hours, minutes] = String(time).split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function computeRestaurantStatus(settings, now = new Date()) {
  const { date, minutes } = restaurantClock(now)
  const withinHours =
    minutes >= toMinutes(settings.openingTime) && minutes < toMinutes(settings.closingTime)
  const closedToday = settings.closedOnDate === date

  return {
    isOpen: withinHours && !closedToday,
    closedToday,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    timeZone: RESTAURANT_TIME_ZONE,
    today: date,
  }
}

export async function getRestaurantStatus() {
  return computeRestaurantStatus(await getSettings())
}

export function closedMessage(status) {
  const hours = `${formatTime(status.openingTime)} – ${formatTime(status.closingTime)}`
  return status.closedToday
    ? `FoodFusion is closed for the rest of today. We open again tomorrow at ${formatTime(status.openingTime)}.`
    : `FoodFusion is closed right now. We're open every day, ${hours}.`
}

// Admin's "Close for today" / "Reopen". Closing stores today's date, so the
// restaurant opens again on its own the next morning.
export async function setClosedToday(closed) {
  await getSettings()
  await prisma.settings.update({
    where: { id: 'singleton' },
    data: { closedOnDate: closed ? restaurantClock().date : null },
  })
  return getRestaurantStatus()
}

/**
 * A booked slot (reservation, or a table picked at checkout) has to start
 * in the future and fit inside opening hours, on the restaurant's clock.
 * Booking ahead is allowed while the restaurant is closed; a slot later
 * today is not, once Admin has closed early.
 */
export async function assertSlotWithinOpeningHours({
  reservationDate,
  reservationTime,
  durationMinutes,
}) {
  const settings = await getSettings()
  const status = computeRestaurantStatus(settings)
  const { date: today, minutes: nowMinutes } = restaurantClock()
  const start = toMinutes(reservationTime)
  const end = start + Number(durationMinutes)

  if (reservationDate < today || (reservationDate === today && start <= nowMinutes)) {
    throw new ApiError(400, 'Reservation date and time must be in the future.')
  }
  if (start < toMinutes(settings.openingTime) || end > toMinutes(settings.closingTime)) {
    throw new ApiError(
      400,
      `Bookings must start and end within opening hours, ${formatTime(settings.openingTime)} – ${formatTime(settings.closingTime)}.`,
    )
  }
  if (reservationDate === today && status.closedToday) {
    throw new ApiError(400, closedMessage(status))
  }
}
