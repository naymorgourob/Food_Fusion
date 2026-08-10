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
  const [pendingId, setPendingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await favoriteService.fetchFavorites()
        if (!cancelled) setFavorites(data)
      } catch {
        if (!cancelled) setFavorites([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

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
      } finally {
        setPendingId(null)
      }
    },
    [favorites],
  )

  return { favorites, isLoading, isFavorite, toggleFavorite, pendingId }
}
