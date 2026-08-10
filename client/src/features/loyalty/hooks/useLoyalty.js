import { useCallback, useEffect, useState } from 'react'
import { fetchLoyaltySummary } from '@/features/loyalty/services/loyaltyService'

// Same refetchIndex pattern as every other list hook in this app
// (useOrders, useBills, useFavorites) — one convention for "load, expose,
// let the caller trigger a reload."
export function useLoyalty() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchLoyaltySummary()
        if (!cancelled) setSummary(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load loyalty points.')
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

  return { summary, isLoading, error, refetch }
}
