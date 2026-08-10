const VALID_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE']

export function validateTable({ number, capacity, status }) {
  const errors = []

  if (number === undefined || number === null || number === '') {
    errors.push('Table number is required.')
  } else if (!Number.isInteger(Number(number)) || Number(number) <= 0) {
    errors.push('Table number must be a positive whole number.')
  }

  if (capacity === undefined || capacity === null || capacity === '') {
    errors.push('Capacity is required.')
  } else if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    errors.push('Capacity must be a positive whole number.')
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push('Status must be one of Available, Occupied, Reserved, or Inactive.')
  }

  return errors
}
