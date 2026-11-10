import { useSyncExternalStore } from 'react'
import { fetchRestaurantStatus } from '@/features/settings/services/settingsService'

// One shared status for the whole app: the top bar, a layout and a page can
// all ask, and there is still only one request a minute. The server stays
// the authority — it rejects closed-hours actions itself — so this only
// decides what to show and which buttons to disable.
const POLL_MS = 60_000

let snapshot = { status: null, isLoading: true }
const listeners = new Set()
let timer = null
let inflight = null

function publish(next) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function load() {
  inflight ??= fetchRestaurantStatus()
    .then((status) => publish({ status, isLoading: false }))
    .catch(() => publish({ ...snapshot, isLoading: false }))
    .finally(() => {
      inflight = null
    })
  return inflight
}

function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) {
    load()
    timer = setInterval(load, POLL_MS)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function useRestaurantStatus() {
  const { status, isLoading } = useSyncExternalStore(subscribe, () => snapshot)
  return {
    status,
    isLoading,
    // Unknown (still loading, or the request failed) counts as open: the
    // server still blocks the action if it isn't, and a flaky network
    // shouldn't lock staff out of the screen.
    isOpen: status?.isOpen ?? true,
    refresh: load,
    // After Admin's Close/Reopen, so every screen updates without waiting
    // for the next poll.
    setStatus: (next) => publish({ status: next, isLoading: false }),
  }
}

// "23:00" -> "11:00 PM"
export function formatOpeningTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

export function closedLabel(status) {
  if (!status) return ''
  return status.closedToday
    ? `Closed for today · opens tomorrow at ${formatOpeningTime(status.openingTime)}`
    : `Closed · open daily ${formatOpeningTime(status.openingTime)} – ${formatOpeningTime(status.closingTime)}`
}
