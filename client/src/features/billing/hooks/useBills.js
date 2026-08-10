import { useCallback, useEffect, useState } from 'react'
import { fetchBills } from '@/features/billing/services/billService'

export function useBills() {
  const [bills, setBills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchBills()
        if (!cancelled) setBills(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load bills.')
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

  return { bills, isLoading, error, refetch }
}
