import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchTables } from '@/features/tables/services/tableService'

export function useTables() {
  const [tables, setTables] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refetchIndex, setRefetchIndex] = useState(0)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    // Skeletons only until the first successful load. A refetch after that
    // (e.g. after a staff action) keeps the current list on screen and swaps
    // in the fresh data when it arrives, instead of blanking the page.
    async function load() {
      if (!hasLoadedRef.current) setIsLoading(true)
      setIsRefreshing(true)
      setError(null)
      try {
        const data = await fetchTables()
        if (!cancelled) {
          setTables(data)
          hasLoadedRef.current = true
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load tables.')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refetchIndex])

  const refetch = useCallback(() => setRefetchIndex((index) => index + 1), [])

  return { tables, isLoading, isRefreshing, error, refetch }
}
