import { api } from '@/services/api'

// Every mutation returns the full updated favorites list, so callers can
// replace state outright instead of re-fetching — one round trip per
// action rather than two.
export async function fetchFavorites() {
  const { data } = await api.get('/favorites')
  return data.data.favorites
}

export async function addFavorite(menuItemId) {
  const { data } = await api.post('/favorites', { menuItemId })
  return data.data.favorites
}

export async function removeFavorite(menuItemId) {
  const { data } = await api.delete(`/favorites/${menuItemId}`)
  return data.data.favorites
}
