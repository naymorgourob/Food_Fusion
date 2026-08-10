// Plain hand-written checks, matching the pattern established in
// auth.validator.js — no validation library in the approved stack.
export function validateCategory({ name, description }) {
  const errors = []

  if (!name || !name.trim()) errors.push('Category name is required.')
  else if (name.trim().length > 80) errors.push('Category name must be 80 characters or fewer.')

  if (description && description.length > 500) {
    errors.push('Description must be 500 characters or fewer.')
  }

  return errors
}
