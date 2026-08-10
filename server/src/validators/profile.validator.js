// Same regex patterns as auth.validator.js — kept as its own copy, same
// reasoning as every other validator file in this codebase.
const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

// No email field here — email is shown on the profile but not editable
// through this endpoint (see profile.service.js).
export function validateProfileUpdate({ fullName, phone }) {
  const errors = []

  if (!fullName || !fullName.trim()) errors.push('Full name is required.')

  if (!phone || !phone.trim()) errors.push('Phone number is required.')
  else if (!PHONE_REGEX.test(phone)) errors.push('Enter a valid phone number.')

  return errors
}

export function validateChangePassword({ currentPassword, newPassword, confirmPassword }) {
  const errors = []

  if (!currentPassword) errors.push('Current password is required.')

  if (!newPassword) errors.push('New password is required.')
  else if (!PASSWORD_REGEX.test(newPassword)) {
    errors.push('New password must be at least 8 characters and include a letter and a number.')
  }

  if (newPassword !== confirmPassword) errors.push('Passwords do not match.')

  return errors
}
