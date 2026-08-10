// Plain hand-written checks — no validation library was in the approved
// stack, and these rules are simple enough that adding one (zod/joi/etc.)
// would be an unjustified dependency for what a handful of if-statements
// already does clearly.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/
// At least one letter and one number, 8+ characters — strict enough to
// reject "password" or "12345678" without demanding symbols undergrad
// testers will forget while demoing.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function validateRegister({ fullName, email, phone, password, confirmPassword }) {
  const errors = []

  if (!fullName || !fullName.trim()) errors.push('Full name is required.')

  if (!email || !email.trim()) errors.push('Email is required.')
  else if (!EMAIL_REGEX.test(email)) errors.push('Enter a valid email address.')

  if (!phone || !phone.trim()) errors.push('Phone number is required.')
  else if (!PHONE_REGEX.test(phone)) errors.push('Enter a valid phone number.')

  if (!password) errors.push('Password is required.')
  else if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 8 characters and include a letter and a number.')
  }

  if (password !== confirmPassword) errors.push('Passwords do not match.')

  return errors
}

export function validateLogin({ email, password }) {
  const errors = []

  if (!email || !email.trim()) errors.push('Email is required.')
  if (!password) errors.push('Password is required.')

  return errors
}
