import { useCallback, useEffect, useState } from 'react'
import * as favoriteService from '@/features/favorites/services/favoriteService'

/**
 * Owns the customer's favorites list plus the toggle action. Because the
 * API returns the whole updated list on every mutation, toggling replaces
 * state directly — no refetch, and no optimistic-update rollback logic to
 * get wrong.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await favoriteService.fetchFavorites()
      setFavorites(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load favorites')
      setFavorites([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isFavorite = useCallback(
    (menuItemId) => favorites.some((item) => item.id === menuItemId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (menuItemId) => {
      setPendingId(menuItemId)
      try {
        const currentlyFavorite = favorites.some((item) => item.id === menuItemId)
        const updated = currentlyFavorite
          ? await favoriteService.removeFavorite(menuItemId)
          : await favoriteService.addFavorite(menuItemId)
        setFavorites(updated)
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to update favorite')
      } finally {
        setPendingId(null)
      }
    },
    [favorites],
  )

  return { favorites, isLoading, error, refetch: load, isFavorite, toggleFavorite, pendingId }
}

