// Mirrors the ReservationOccasion enum in server/prisma/schema.prisma.
// OTHER pairs with the free-text occasionNote, so "Others" isn't a dead end.
export const RESERVATION_OCCASIONS = [
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'FAMILY_DINNER', label: 'Family Dinner' },
  { value: 'BUSINESS_MEETING', label: 'Business Meeting' },
  { value: 'DATE', label: 'Date' },
  { value: 'OTHER', label: 'Others' },
]

export const OCCASION_LABELS = Object.fromEntries(
  RESERVATION_OCCASIONS.map(({ value, label }) => [value, label]),
)

// Booking slots offered in the reservation wizard (lunch, then dinner).
// Shared so the landing page quotes the same times the form offers.
export const SUGGESTED_TIMES = [
  '12:00',
  '12:30',
  '13:00',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
]
