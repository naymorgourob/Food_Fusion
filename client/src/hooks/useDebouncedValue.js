import { useEffect, useState } from 'react'

// Delays reacting to a fast-changing value (typing in a search box) so the
// menu items list doesn't fire an API request on every keystroke.
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
