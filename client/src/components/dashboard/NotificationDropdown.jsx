import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

// UI only, as specified — no notifications backend exists yet. Honestly
// empty rather than faking fixture data that implies a feature that isn't
// built.
export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Notifications"
        className="rounded-full p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-surface p-4 shadow-lg">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          <p className="mt-2 text-sm text-ink-muted">No new notifications.</p>
        </div>
      )}
    </div>
  )
}
