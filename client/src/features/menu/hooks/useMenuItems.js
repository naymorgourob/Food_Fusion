import { useCallback, useEffect, useState } from 'react'
import { fetchMenuItems } from '@/features/menu/services/menuItemService'

const EMPTY_PAGINATION = { page: 1, pageSize: 10, total: 0, totalPages: 1 }

export function useMenuItems(params) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  // Destructured to primitive values on purpose: `params` is a new object
  // reference every render, which would otherwise retrigger this effect
  // every render and refetch in a loop.
  const { search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize } = params

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchMenuItems({ search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize })
        if (!cancelled) {
          setItems(result.items)
          setPagination(result.pagination)
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load menu items.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize, refetchIndex])

  const refetch = useCallback(() => setRefetchIndex((index) => index + 1), [])

  return { items, pagination, isLoading, error, refetch }
}
