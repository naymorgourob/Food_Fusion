// Same patterns as auth.validator.js — kept as its own copy rather than an
// import, matching how every other validator file in this codebase
// (reservation, order, bill) stays self-contained rather than sharing
// regex constants across files.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function validateStaffFields({ fullName, email, phone, position }) {
  const errors = []

  if (!fullName || !fullName.trim()) errors.push('Full name is required.')

  if (!email || !email.trim()) errors.push('Email is required.')
  else if (!EMAIL_REGEX.test(email)) errors.push('Enter a valid email address.')

  if (!phone || !phone.trim()) errors.push('Phone number is required.')
  else if (!PHONE_REGEX.test(phone)) errors.push('Enter a valid phone number.')

  if (!position || !position.trim()) errors.push('Position is required.')

  return errors
}

// Whether the email is actually free is a database question, answered in
// staff.service.js — same split as every other validator/service pair.
export function validateStaffCreate(input) {
  const errors = validateStaffFields(input)

  if (!input.password) errors.push('Password is required.')
  else if (!PASSWORD_REGEX.test(input.password)) {
    errors.push('Password must be at least 8 characters and include a letter and a number.')
  }

  return errors
}

// No password field here — Edit Staff changes profile details only, never
// the password (that would be a "reset password" feature, out of this
// part's scope).
export function validateStaffUpdate(input) {
  return validateStaffFields(input)
}

export function validateActiveStatus(isActive) {
  if (typeof isActive !== 'boolean') return ['Status must be true (active) or false (inactive).']
  return []
}
