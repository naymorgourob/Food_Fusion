import { useEffect, useState } from 'react'
import { fetchMenuItems } from '@/features/menu/services/menuItemService'

/**
 * Available menu items for the dashboard's "Recommended" slider.
 *
 * Uses the existing GET /menu/items endpoint with the availability filter
 * the backend already supports — no new API. "Recommended" is simply the
 * current available menu, capped: there is no recommendation engine in this
 * project, and inventing one would mean backend work this task forbids.
 */
export function useRecommendedItems(limit = 8) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchMenuItems({ isAvailable: 'true', pageSize: limit })
        if (!cancelled) setItems(data.items)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [limit])

  return { items, isLoading }
}
