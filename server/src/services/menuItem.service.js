import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '../../uploads/menu')

const CATEGORY_SELECT = { id: true, name: true, isActive: true }

const SORT_MAP = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  name: { name: 'asc' },
  price: { price: 'asc' },
}

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) throw new ApiError(400, 'Selected category does not exist.')
}

async function getFoodOrThrow(id) {
  const food = await prisma.food.findUnique({ where: { id }, include: { category: { select: CATEGORY_SELECT } } })
  if (!food) throw new ApiError(404, 'Menu item not found.')
  return food
}

// Best-effort disk cleanup — a missing/already-gone file is not worth
// failing the request over, so errors here are deliberately swallowed.
function deleteImageFile(imageUrl) {
  if (!imageUrl) return
  fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl)), () => {})
}

export async function listMenuItems({ search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize }) {
  const currentPage = Math.max(1, Number(page) || 1)
  const size = Math.min(50, Math.max(1, Number(pageSize) || 10))

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    // Must check for the two real values explicitly, not `!== undefined` —
    // the frontend's "Any availability" default sends isAvailable='' (an
    // empty string, present but meaningless), which is NOT undefined and
    // was being coerced into `isAvailable: false`, silently filtering the
    // list down to only unavailable items.
    ...(isAvailable === 'true' || isAvailable === 'false' ? { isAvailable: isAvailable === 'true' } : {}),
    ...(categoryStatus ? { category: { isActive: categoryStatus === 'active' } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.food.findMany({
      where,
      include: { category: { select: CATEGORY_SELECT } },
      orderBy: SORT_MAP[sortBy] ?? SORT_MAP.newest,
      skip: (currentPage - 1) * size,
      take: size,
    }),
    prisma.food.count({ where }),
  ])

  return {
    items,
    pagination: {
      page: currentPage,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    },
  }
}

export async function getMenuItemById(id) {
  return getFoodOrThrow(id)
}

export async function createMenuItem(input, file) {
  const { name, description, price, prepTimeMinutes, isAvailable, categoryId } = input
  await assertCategoryExists(categoryId)

  return prisma.food.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price, // kept as the original string — Prisma's Decimal accepts it
      // directly and this avoids ever round-tripping money through a JS float.
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : null,
      isAvailable: isAvailable === undefined ? true : isAvailable === 'true' || isAvailable === true,
      categoryId,
      imageUrl: file ? `/uploads/menu/${file.filename}` : null,
    },
    include: { category: { select: CATEGORY_SELECT } },
  })
}

export async function updateMenuItem(id, input, file) {
  const { name, description, price, prepTimeMinutes, isAvailable, categoryId } = input
  const existing = await getFoodOrThrow(id)
  await assertCategoryExists(categoryId)

  // Swapping in a new photo — remove the old one so uploads/ doesn't
  // accumulate orphaned files every time an admin changes a picture.
  if (file && existing.imageUrl) deleteImageFile(existing.imageUrl)

  return prisma.food.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price,
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : null,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      categoryId,
      ...(file ? { imageUrl: `/uploads/menu/${file.filename}` } : {}),
    },
    include: { category: { select: CATEGORY_SELECT } },
  })
}

export async function deleteMenuItem(id) {
  const existing = await getFoodOrThrow(id)
  await prisma.food.delete({ where: { id } })
  deleteImageFile(existing.imageUrl)
}
