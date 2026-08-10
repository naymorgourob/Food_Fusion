import { useCallback, useEffect, useState } from 'react'
import { fetchInventoryItems } from '@/features/inventory/services/inventoryService'

export function useInventory() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchInventoryItems()
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load inventory.')
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

  return { items, isLoading, error, refetch }
}
