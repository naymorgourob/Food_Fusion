import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Prisma's own @unique on Category.name catches this at the database level
// too (belt and suspenders against a race condition), but checking first —
// case-insensitively, via Postgres ILIKE under the hood — gives a specific,
// friendly error instead of a generic constraint-violation message.
async function assertNameIsAvailable(name, excludeId = null) {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name.trim(), mode: 'insensitive' },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
  if (existing) throw new ApiError(409, 'A category with this name already exists.')
}

async function getCategoryOrThrow(id) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new ApiError(404, 'Category not found.')
  return category
}

function withItemCount(category) {
  const { _count, ...rest } = category
  return { ...rest, itemCount: _count.foods }
}

export async function listCategories({ search } = {}) {
  const categories = await prisma.category.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { foods: true } } },
  })
  return categories.map(withItemCount)
}

export async function createCategory({ name, description }) {
  await assertNameIsAvailable(name)
  const category = await prisma.category.create({
    data: { name: name.trim(), description: description?.trim() || null },
    include: { _count: { select: { foods: true } } },
  })
  return withItemCount(category)
}

export async function updateCategory(id, { name, description, isActive }) {
  await getCategoryOrThrow(id)
  await assertNameIsAvailable(name, id)

  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim(), description: description?.trim() || null, isActive },
    include: { _count: { select: { foods: true } } },
  })
  return withItemCount(category)
}

export async function deleteCategory(id) {
  const category = await getCategoryOrThrow(id)
  const itemCount = await prisma.food.count({ where: { categoryId: id } })

  if (itemCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete "${category.name}" — ${itemCount} menu item${itemCount === 1 ? '' : 's'} still assigned to it.`,
    )
  }

  await prisma.category.delete({ where: { id } })
}
