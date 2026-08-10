import { listFavorites, addFavorite, removeFavorite } from '../services/favorite.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getFavorites(req, res) {
  const favorites = await listFavorites(req.user.id)
  sendSuccess(res, { message: 'Favorites fetched successfully.', data: { favorites } })
}

export async function postFavorite(req, res) {
  const { menuItemId } = req.body
  if (!menuItemId || !String(menuItemId).trim()) {
    throw new ApiError(400, 'Validation failed.', ['Menu item is required.'])
  }

  const favorites = await addFavorite(req.user.id, menuItemId)
  sendSuccess(res, { statusCode: 201, message: 'Added to favorites.', data: { favorites } })
}

export async function removeFavoriteHandler(req, res) {
  const favorites = await removeFavorite(req.user.id, req.params.menuItemId)
  sendSuccess(res, { message: 'Removed from favorites.', data: { favorites } })
}
