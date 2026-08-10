import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from '../config/prisma.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { ApiError } from '../utils/ApiError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '../../uploads/profile')

const PUBLIC_USER_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  profileImage: true,
  isActive: true,
  createdAt: true,
}

// Best-effort disk cleanup — a missing/already-gone file isn't worth
// failing the request over, same reasoning as menuItem.service.js.
function deleteImageFile(imageUrl) {
  if (!imageUrl) return
  fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl)), () => {})
}

// email is never accepted here — see profile.validator.js for why it's
// excluded from editing entirely.
export async function updateProfile(userId, { fullName, phone }, file) {
  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) throw new ApiError(404, 'User not found.')

  if (file && existing.profileImage) deleteImageFile(existing.profileImage)

  return prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      ...(file ? { profileImage: `/uploads/profile/${file.filename}` } : {}),
    },
    select: PUBLIC_USER_FIELDS,
  })
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found.')

  const matches = await comparePassword(currentPassword, user.password)
  if (!matches) throw new ApiError(400, 'Current password is incorrect.')

  const hashedPassword = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } })
}
