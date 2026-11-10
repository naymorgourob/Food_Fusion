import { Clock } from 'lucide-react'
import {
  useRestaurantStatus,
  formatOpeningTime,
  closedLabel,
} from '@/features/settings/hooks/useRestaurantStatus'

// Small pill for top bars: "Open · until 11:00 PM" or "Closed".
export function RestaurantStatusBadge({ className = '' }) {
  const { status } = useRestaurantStatus()
  if (!status) return null

  return (
    <span
      title={status.isOpen ? undefined : closedLabel(status)}
      className={`inline-flex flex-none items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${
        status.isOpen
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'
      } ${className}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {status.isOpen ? (
        <>
          Open
          <span className="hidden sm:inline"> · until {formatOpeningTime(status.closingTime)}</span>
        </>
      ) : (
        'Closed'
      )}
    </span>
  )
}

// Full-width notice shown above work screens while the restaurant is closed.
export function RestaurantClosedBanner({ message }) {
  const { status } = useRestaurantStatus()
  if (!status || status.isOpen) return null

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200"
    >
      <Clock className="mt-0.5 h-4 w-4 flex-none" />
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{closedLabel(status)}</span>
        <span className="text-red-700/90 dark:text-red-300/90">{message}</span>
      </div>
    </div>
  )
}
