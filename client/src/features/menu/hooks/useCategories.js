import { useCallback, useEffect, useState } from 'react'
import { fetchCategories } from '@/features/menu/services/categoryService'

// No React Query/SWR in the approved stack — a small hand-rolled
// fetch-on-mount-plus-refetch hook covers what this module needs without
// adding a new dependency.
export function useCategories(search) {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // Bumping this is how `refetch()` re-triggers the effect below without
  // the effect needing to call an externally-defined callback directly.
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchCategories(search)
        if (!cancelled) setCategories(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load categories.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [search, refetchIndex])

  const refetch = useCallback(() => setRefetchIndex((index) => index + 1), [])

  return { categories, isLoading, error, refetch }
}
