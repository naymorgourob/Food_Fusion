import { useCallback, useEffect, useState } from 'react'
import { fetchStaff } from '@/features/staff/services/staffService'

export function useStaff() {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchStaff()
        if (!cancelled) setStaff(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load staff.')
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

  return { staff, isLoading, error, refetch }
}
