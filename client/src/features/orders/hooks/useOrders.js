import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchOrders } from '@/features/orders/services/orderService'

export function useOrders() {
  const [orders, setOrders] = useState([])
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
        const data = await fetchOrders()
        if (!cancelled) {
          setOrders(data)
          hasLoadedRef.current = true
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load orders.')
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

  // Swaps in the order an update endpoint returned (same ORDER_INCLUDE shape
  // as the list), so the new status shows the moment the request succeeds
  // rather than after the follow-up refetch.
  const replaceOrder = useCallback((updated) => {
    if (!updated?.id) return
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)))
  }, [])

  return { orders, isLoading, isRefreshing, error, refetch, replaceOrder }
}
