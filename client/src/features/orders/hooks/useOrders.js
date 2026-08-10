import { useCallback, useEffect, useState } from 'react'
import { fetchOrders } from '@/features/orders/services/orderService'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchOrders()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load orders.')
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

  return { orders, isLoading, error, refetch }
}
