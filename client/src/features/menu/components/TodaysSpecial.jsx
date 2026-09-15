import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Sparkles, UtensilsCrossed } from 'lucide-react'
import { getMenuImageUrl } from '@/constants'
import { money } from '@/utils/format'

/**
 * A single featured dish, presented as the house special (UI-03).
 *
 * There is no "special" or "featured" flag on Food, so the caller picks
 * the dish deterministically from the real menu (see pickSpecial below) —
 * the *presentation* is editorial, but the dish, price, and prep time on
 * screen are the genuine record. No countdown timer is shown: nothing in
 * the schema expires, and a fake ticking clock is a dark pattern.
 */

export function TodaysSpecial({ dish, onView, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!dish) return null

  const { primary, fallback } = getMenuImageUrl(dish)
  const image = imageFailed ? fallback : primary || fallback

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="todays-special-heading"
      className="relative isolate overflow-hidden rounded-3xl bg-brand-800"
    >
      <div className="grid gap-0 md:grid-cols-2">
        {/* --- Copy --------------------------------------------------- */}
        <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-300" />
            <span className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
              Today&rsquo;s Special
            </span>
          </span>

          <h2 id="todays-special-heading" className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {dish.name}
          </h2>

          {dish.description && (
            <p className="max-w-md text-sm leading-relaxed text-white/75">{dish.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-display text-3xl font-semibold text-gold-300">{money(dish.price)}</span>
            {dish.prepTimeMinutes && (
              <span className="flex items-center gap-1.5 text-sm text-white/70">
                <Clock className="h-4 w-4" />
                Ready in ~{dish.prepTimeMinutes} min
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onAdd(dish)}
              className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Order now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => onView(dish)}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              View details
            </button>
          </div>
        </div>

        {/* --- Image -------------------------------------------------- */}
        <div className="relative min-h-[15rem] overflow-hidden md:min-h-full">
          {image ? (
              <img
                src={image}
                alt={`${dish.name} - ${dish.description || 'FoodFusion menu item'}`}
                title={dish.name}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-900">
              <UtensilsCrossed className="h-14 w-14 text-white/15" strokeWidth={1.25} />
            </span>
          )}
          {/* Feathers the image into the emerald panel on wide screens. */}
          <span
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-r from-brand-800 via-brand-800/40 to-transparent md:block"
          />
        </div>
      </div>
    </motion.section>
  )
}
