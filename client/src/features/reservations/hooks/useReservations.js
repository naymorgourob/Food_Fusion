import { useCallback, useEffect, useState } from 'react'
import { fetchReservations } from '@/features/reservations/services/reservationService'

export function useReservations() {
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchReservations()
        if (!cancelled) setReservations(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load reservations.')
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

  return { reservations, isLoading, error, refetch }
}
