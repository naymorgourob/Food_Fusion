import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'

/**
 * Transient "added to your order" confirmation (UI-03).
 *
 * The spec asked that adding a dish not redirect. This is the feedback
 * that replaces the redirect: it confirms the add, names the dish, and
 * offers a one-tap route to the cart without moving the customer off the
 * menu they're browsing.
 *
 * aria-live="polite" announces the same thing to a screen reader, which
 * can't perceive the animation. role="status" keeps it out of the tab
 * order until the customer chooses to act on it.
 */
const VISIBLE_MS = 2600

export function AddedToCartToast({ lastAdded, count, onOpenCart }) {
  // Visibility is *derived* from which add has been dismissed rather than
  // set on every add — the effect only schedules the auto-dismiss, so
  // adding a dish doesn't trigger a cascading render.
  const [dismissedAt, setDismissedAt] = useState(0)
  const visible = Boolean(lastAdded) && lastAdded.at !== dismissedAt

  useEffect(() => {
    if (!lastAdded) return undefined
    // Keyed on `at`, so adding the same dish twice restarts the timer
    // rather than the second add being swallowed by the first timeout.
    const timer = setTimeout(() => setDismissedAt(lastAdded.at), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [lastAdded])

  return (
    <AnimatePresence>
      {visible && lastAdded && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-brand-700/20 bg-brand-800 p-3 pr-4 shadow-2xl shadow-brand-900/30 sm:inset-x-auto sm:right-6"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold-500 text-charcoal">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </span>

          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-white">{lastAdded.name}</span>
            <span className="text-xs text-white/65">Added to your order</span>
          </span>

          <button
            type="button"
            onClick={onOpenCart}
            className="flex flex-none items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            View · {count}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
