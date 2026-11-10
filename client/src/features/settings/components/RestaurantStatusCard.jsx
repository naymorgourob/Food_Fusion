import { useState } from 'react'
import { Store } from 'lucide-react'
import { updateRestaurantStatus } from '@/features/settings/services/settingsService'
import {
  useRestaurantStatus,
  formatOpeningTime,
  closedLabel,
} from '@/features/settings/hooks/useRestaurantStatus'
import { RestaurantStatusBadge } from '@/features/settings/components/RestaurantStatus'

// Admin's open/closed control. Opening and closing are automatic (opening
// hours below); this only closes early for the rest of today, or undoes that.
export function RestaurantStatusCard() {
  const { status, setStatus } = useRestaurantStatus()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle(closedToday) {
    setIsSaving(true)
    setError('')
    try {
      setStatus(await updateRestaurantStatus(closedToday))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not update the restaurant status.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!status) return null

  const hours = `${formatOpeningTime(status.openingTime)} – ${formatOpeningTime(status.closingTime)}`

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Store className="mt-0.5 h-5 w-5 flex-none text-ink-muted" />
          <div className="flex flex-col gap-1">
            <h2 className="text-h4 font-semibold text-ink">Restaurant Status</h2>
            <p className="text-sm text-ink-muted">
              {status.isOpen
                ? `Open now. Closes automatically at ${formatOpeningTime(status.closingTime)}.`
                : closedLabel(status)}
            </p>
            <p className="text-xs text-ink-faint">
              Opens and closes on its own every day, {hours} (Bangladesh time). While closed, chefs
              and waiters can&apos;t accept, take or update orders. Customers can still order and
              book, and you can still approve payments and bookings.
            </p>
          </div>
        </div>
        <RestaurantStatusBadge />
      </div>

      {error && (
        <p className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {status.closedToday ? (
        <button
          type="button"
          onClick={() => handleToggle(false)}
          disabled={isSaving}
          className="self-start rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Reopening…' : 'Reopen today'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleToggle(true)}
          disabled={isSaving}
          className="self-start rounded-md border border-danger-soft bg-danger-soft px-5 py-2.5 text-sm font-semibold text-danger hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Closing…' : 'Close for today'}
        </button>
      )}
    </section>
  )
}
