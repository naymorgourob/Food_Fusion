// Shared by the customer's reservation form and the Admin/Staff details
// modal, so both always render the same wording for a given enum value.
// Mirrors ReservationOccasion in server/prisma/schema.prisma.
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
