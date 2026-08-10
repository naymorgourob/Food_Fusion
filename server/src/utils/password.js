import bcrypt from 'bcrypt'

// 10 rounds is bcrypt's own recommended default — enough work to make
// brute-forcing a stolen hash impractical, without making every login
// noticeably slow. Kept in one place so both register and any future
// "change password" flow always hash the same way.
const SALT_ROUNDS = 10

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

export function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}
