const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/
const MIN_DURATION_MINUTES = 30
const MAX_DURATION_MINUTES = 240
const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
const VALID_OCCASIONS = ['BIRTHDAY', 'ANNIVERSARY', 'FAMILY_DINNER', 'BUSINESS_MEETING', 'DATE', 'OTHER']

export function validateReservation({
  customerName,
  customerPhone,
  tableId,
  guestCount,
  reservationDate,
  reservationTime,
  durationMinutes,
  occasion,
  paymentReference,
  paymentProofImage,
}) {
  const errors = []

  if ((!paymentReference || !String(paymentReference).trim()) && !paymentProofImage) {
    errors.push('Submit a transaction/reference ID or upload payment proof.')
  }

  if (!customerName || !customerName.trim()) errors.push('Customer name is required.')

  if (!customerPhone || !customerPhone.trim()) errors.push('Phone number is required.')
  else if (!PHONE_REGEX.test(customerPhone)) errors.push('Enter a valid phone number.')

  if (!tableId || !tableId.trim()) errors.push('Please select a table.')

  if (guestCount === undefined || guestCount === null || guestCount === '') {
    errors.push('Number of guests is required.')
  } else if (!Number.isInteger(Number(guestCount)) || Number(guestCount) <= 0) {
    errors.push('Number of guests must be a positive whole number.')
  }

  if (!reservationDate) errors.push('Reservation date is required.')

  if (!reservationTime) errors.push('Reservation time is required.')
  else if (!TIME_REGEX.test(reservationTime)) errors.push('Reservation time must be in HH:MM format.')

  if (durationMinutes !== undefined && durationMinutes !== null && durationMinutes !== '') {
    if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < MIN_DURATION_MINUTES || Number(durationMinutes) > MAX_DURATION_MINUTES) {
      errors.push(`Reservation duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`)
    }
  }

  // Only check "in the future" once date/time are individually well-formed —
  // no point reporting a confusing combined error on top of a format error.
  if (reservationDate && reservationTime && TIME_REGEX.test(reservationTime)) {
    const requestedAt = new Date(`${reservationDate}T${reservationTime}:00`)
    if (Number.isNaN(requestedAt.getTime()) || requestedAt.getTime() <= Date.now()) {
      errors.push('Reservation date and time must be in the future.')
    }
  }

  // Occasion is optional (Part 18.1) — only validated when supplied, so
  // existing reservation flows that omit it entirely still pass.
  if (occasion && !VALID_OCCASIONS.includes(occasion)) {
    errors.push('Select a valid occasion.')
  }

  return errors
}

export function validateStatus(status) {
  if (!status || !VALID_STATUSES.includes(status)) {
    return ['Status must be one of Pending, Confirmed, Cancelled, or Completed.']
  }
  return []
}
