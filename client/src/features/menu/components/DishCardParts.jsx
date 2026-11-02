import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Minus } from 'lucide-react'

/**
 * Pieces shared by the food and drink cards. `theme` picks the palette:
 * "glass" (food, frosted card), "blush" (warm menu card) or "cafe" (drinks,
 * coffee-house brown).
 */

export function Marker({ icon: Icon, label, className }) {
  return (
    <span
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur ${className}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function FavoriteButton({
  dish,
  isFavorite,
  isPending,
  onToggle,
  className = '',
  theme = 'blush',
}) {
  const surface =
    theme === 'cafe'
      ? 'h-9 w-9 border-white/15 bg-[#3A241A]/85 text-[#E8D5C6]'
      : theme === 'glass'
        ? 'h-11 w-11 border-white/60 bg-white/60 text-[#3B3531]'
        : 'h-9 w-9 border-white/70 bg-white/70 text-body-muted'
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={() => onToggle(dish.id)}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`
      }
      className={`z-20 flex items-center justify-center rounded-full border shadow-sm backdrop-blur transition-transform hover:scale-110 disabled:opacity-60 ${surface} ${className}`}
    >
      <motion.span
        key={String(isFavorite)}
        initial={{ scale: isFavorite ? 0.5 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
        />
      </motion.span>
    </motion.button>
  )
}

const CONTROL_THEMES = {
  blush: {
    burst: 'text-gold-500',
    stepper: 'bg-brand-700 text-white shadow-brand-900/30',
    plus: 'bg-gold-500 text-charcoal hover:bg-gold-400',
    add: 'rounded-2xl bg-gold-500 text-charcoal shadow-gold-500/25 hover:bg-gold-400',
  },
  glass: {
    burst: 'text-[#3B3531]',
    stepper: 'bg-[#3B3531] text-white shadow-black/25',
    plus: 'bg-white text-[#3B3531] hover:bg-[#F1ECE6]',
    add: 'rounded-full bg-[#3B3531] text-white shadow-black/25 hover:bg-[#2A2522]',
    label: 'Order',
  },
  cafe: {
    burst: 'text-[#8CC2BE]',
    stepper: 'bg-[#2E1C14] text-[#F5E9DF] ring-1 ring-white/10 shadow-black/30',
    plus: 'bg-[#6FA3A0] text-white hover:bg-[#5E918E]',
    add: 'rounded-full bg-[#6FA3A0] text-white shadow-[#2E1C14]/40 hover:bg-[#5E918E] !h-14 !w-14 [&_svg]:!h-6 [&_svg]:!w-6',
  },
}

// Add button that morphs into a − qty + stepper once the dish is in the cart.
export function CartControl({
  dish,
  quantity,
  unavailable,
  bursts,
  onAdd,
  onChange,
  theme = 'blush',
  block = false,
}) {
  const colors = CONTROL_THEMES[theme]
  return (
    <div className={`relative ${block ? 'w-full' : ''}`}>
      <AnimatePresence>
        {bursts.map((id) => (
          <motion.span
            key={id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -36, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            aria-hidden
            className={`pointer-events-none absolute -top-2 right-2 text-sm font-bold ${colors.burst}`}
          >
            +1
          </motion.span>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="popLayout" initial={false}>
        {quantity > 0 ? (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className={`flex items-center gap-1 rounded-full p-1 shadow-lg ${block ? 'h-12 w-full justify-between px-1.5' : ''} ${colors.stepper}`}
          >
            <button
              type="button"
              onClick={() => onChange(quantity - 1)}
              aria-label={`Remove one ${dish.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            >
              <Minus className="h-4 w-4" />
            </button>
            <motion.span
              key={quantity}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              aria-live="polite"
              className="min-w-5 text-center text-sm font-bold tabular-nums"
            >
              {quantity}
            </motion.span>
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              disabled={unavailable}
              aria-label={`Add one more ${dish.name}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-50 ${colors.plus}`}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            type="button"
            onClick={onAdd}
            disabled={unavailable}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={unavailable ? undefined : colors.label ? { scale: 1.04 } : { rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            aria-label={
              unavailable
                ? `${dish.name} is currently unavailable`
                : `Add ${dish.name} to your order`
            }
            className={`flex items-center shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${block ? 'justify-between' : 'justify-center'} ${
              colors.label
                ? `h-12 gap-3 pr-1.5 pl-5 text-sm font-medium tracking-wide ${block ? 'w-full' : ''}`
                : 'h-11 w-11'
            } ${colors.add}`}
          >
            {colors.label ? (
              <>
                {colors.label}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3B3531]">
                  <Plus className="h-4 w-4" strokeWidth={2.75} />
                </span>
              </>
            ) : (
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
