import { useCallback, useState } from 'react'

const STORAGE_KEY = 'foodfusion-preferences'

const DEFAULTS = {
  notifyOrderUpdates: true,
  notifyReservationUpdates: true,
  notifyPromotions: false,
  language: 'en',
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

/**
 * Notification and language preferences (UI-09) — stored in localStorage
 * only, never sent to the server. There is no preferences table on User
 * and no endpoint to save one to, and there's exactly one supported
 * language in this app's copy — so rather than build a settings form that
 * silently does nothing server-side, or a language switcher with nowhere
 * to switch to, this is scoped honestly: real, working, on-this-device
 * settings, labelled as such in AccountSettingsPage.
 */
export function useLocalPreferences() {
  const [preferences, setPreferences] = useState(readStored)

  const update = useCallback((patch) => {
    setPreferences((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { preferences, update }
}
