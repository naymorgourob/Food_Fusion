import { useEffect } from 'react'

// Shared by ProfileDropdown and NotificationDropdown — both need "click
// anywhere else closes this" behavior, so it's written once here instead
// of twice.
export function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onOutsideClick])
}
