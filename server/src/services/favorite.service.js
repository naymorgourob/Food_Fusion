import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Everything the Favorites page and the wizard's menu picker need to
// render an item — same shape menuItem.service.js returns, so the
// frontend can reuse its existing item components unchanged.
const MENU_ITEM_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  isAvailable: true,
  category: { select: { id: true, name: true } },
}

export async function listFavorites(customerId) {
  const favorites = await prisma.favoriteMenuItem.findMany({
    where: { customerId },
    include: { menuItem: { select: MENU_ITEM_SELECT } },
    orderBy: { createdAt: 'desc' },
  })
  // Flattened to plain menu items with a favouritedAt stamp — callers want
  // to render food, not join rows.
  return favorites.map((favorite) => ({ ...favorite.menuItem, favoritedAt: favorite.createdAt }))
}

export async function addFavorite(customerId, menuItemId) {
  const menuItem = await prisma.food.findUnique({ where: { id: menuItemId } })
  if (!menuItem) throw new ApiError(400, 'Selected menu item does not exist.')

  // Idempotent by design: favouriting something already favourited is a
  // no-op success, not a 409. The @@unique in schema.prisma is what makes
  // this safe under a double-tap; upsert turns that into a friendly outcome.
  await prisma.favoriteMenuItem.upsert({
    where: { customerId_menuItemId: { customerId, menuItemId } },
    update: {},
    create: { customerId, menuItemId },
  })

  return listFavorites(customerId)
}

export async function removeFavorite(customerId, menuItemId) {
  // deleteMany rather than delete: removing something that isn't favourited
  // should also be a no-op, not a P2025 crash.
  await prisma.favoriteMenuItem.deleteMany({ where: { customerId, menuItemId } })
  return listFavorites(customerId)
}
