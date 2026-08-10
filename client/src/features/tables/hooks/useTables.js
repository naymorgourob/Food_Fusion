import { useCallback, useEffect, useState } from 'react'
import { fetchTables } from '@/features/tables/services/tableService'

export function useTables() {
  const [tables, setTables] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchTables()
        if (!cancelled) setTables(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load tables.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refetchIndex])

  const refetch = useCallback(() => setRefetchIndex((index) => index + 1), [])

  return { tables, isLoading, error, refetch }
}
