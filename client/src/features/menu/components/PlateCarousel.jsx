import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import { DishPlate } from '@/features/menu/components/DishPlate'
import { money } from '@/utils/format'

const AUTOPLAY_MS = 4500
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 400
// How far the plates roll per step, and how much a live drag turns them.
const DEGREES_PER_STEP = 72
const DEGREES_PER_PIXEL = 0.45

// Slot geometry for each distance from the centre plate. x/y are percentages
// of the plate's own size, so the arc scales with the plate.
const SLOTS = {
  0: { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 },
  1: { x: 74, y: 24, scale: 0.5, opacity: 0.8, blur: 0 },
  2: { x: 130, y: 52, scale: 0.34, opacity: 0, blur: 4 },
}

function slotFor(offset) {
  const slot = SLOTS[Math.min(Math.abs(offset), 2)]
  const side = Math.sign(offset)
  return {
    x: `${slot.x * side}%`,
    y: `${slot.y}%`,
    scale: slot.scale,
    opacity: slot.opacity,
    filter: `blur(${slot.blur}px) brightness(${offset === 0 ? 1 : 0.7})`,
    zIndex: 10 - Math.abs(offset),
  }
}

// Signed shortest distance from the active index, so the ring wraps.
function offsetOf(index, active, count) {
  let offset = (((index - active) % count) + count) % count
  if (offset > count / 2) offset -= count
  return offset
}

/**
 * Swipeable ring of plated dishes for the menu hero. Swiping (or dragging,
 * arrow keys, or the buttons) rolls every plate like a wheel; the centre
 * plate also turns slowly on its own. Tapping the centre plate opens the
 * dish's quick view.
 */
export function PlateCarousel({ dishes, onView, onAdd }) {
  const [active, setActive] = useState(0)
  const [turn, setTurn] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const didPan = useRef(false)

  const dragX = useMotionValue(0)
  const wheel = useSpring(0, { stiffness: 70, damping: 16 })
  const rotate = useTransform([wheel, dragX], ([base, drag]) => base + drag * DEGREES_PER_PIXEL)

  const count = dishes.length

  useEffect(() => {
    wheel.set(-turn * DEGREES_PER_STEP)
  }, [turn, wheel])

  function step(direction) {
    if (count < 2) return
    setActive((current) => (current + direction + count) % count)
    setTurn((current) => current + direction)
  }

  function goTo(index) {
    const offset = offsetOf(index, active, count)
    if (offset === 0) return
    setActive(index)
    setTurn((current) => current + offset)
  }

  // Autoplay restarts after every change, so a manual swipe never gets
  // overridden a split second later.
  useEffect(() => {
    if (isPaused || reduceMotion || count < 2) return
    const timer = setTimeout(() => step(1), AUTOPLAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isPaused, reduceMotion, count])

  if (count === 0) {
    return (
      <div
        className="skeleton mx-auto aspect-square w-[min(19rem,68vw)] rounded-full"
        aria-hidden
      />
    )
  }

  const current = dishes[active]

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured dishes"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') step(-1)
        if (event.key === 'ArrowRight') step(1)
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex flex-col items-center gap-5 focus:outline-none"
    >
      {/* --- Stage --------------------------------------------------- */}
      <motion.div
        onPanStart={() => {
          didPan.current = true
          setIsPaused(true)
        }}
        onPan={(_, info) => dragX.set(info.offset.x)}
        onPanEnd={(_, info) => {
          const { x } = info.offset
          const velocity = info.velocity.x
          let direction = 0
          if (x < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY) direction = 1
          else if (x > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) direction = -1
          // Hand the drag's rotation over to the spring so the wheel rolls
          // on from where the finger left it instead of snapping.
          wheel.jump(wheel.get() + dragX.get() * DEGREES_PER_PIXEL)
          dragX.set(0)
          if (direction) step(direction)
          else wheel.set(-turn * DEGREES_PER_STEP)
          setIsPaused(false)
        }}
        style={{
          touchAction: 'pan-y',
          // Side plates peek in and fade out at the edges, like a lazy susan
          // turning past the frame, instead of spilling over the copy.
          maskImage: 'linear-gradient(to right, transparent, black 16%, black 84%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 16%, black 84%, transparent)',
        }}
        className="relative flex h-[min(21rem,74vw)] w-full cursor-grab overflow-hidden items-center justify-center active:cursor-grabbing"
      >
        {/* Warm glow the centre plate sits in. */}
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,205,138,0.28),rgba(232,205,138,0.06)_45%,transparent_70%)] blur-2xl"
        />

        {dishes.map((dish, index) => {
          const offset = offsetOf(index, active, count)
          const isCenter = offset === 0
          return (
            <motion.button
              key={dish.id}
              type="button"
              tabIndex={isCenter ? 0 : -1}
              aria-label={isCenter ? `View ${dish.name}` : `Show ${dish.name}`}
              aria-hidden={Math.abs(offset) > 1}
              initial={false}
              animate={slotFor(offset)}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              onClick={() => {
                if (didPan.current) {
                  didPan.current = false
                  return
                }
                if (isCenter) onView(dish)
                else goTo(index)
              }}
              className="absolute w-[min(17rem,60vw)] rounded-full focus-visible:ring-4 focus-visible:ring-gold-400/60 focus-visible:outline-none"
              style={{ pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto' }}
            >
              <DishPlate dish={dish} rotate={rotate} />
            </motion.button>
          )
        })}
      </motion.div>

      {/* --- Caption ------------------------------------------------- */}
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous dish"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="truncate text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
                {current.name}
              </p>
              <p className="flex items-center gap-3 text-sm text-white/60">
                <span className="font-display text-lg font-semibold text-gold-300">
                  {money(current.price)}
                </span>
                {current.prepTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {current.prepTimeMinutes} min
                  </span>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next dish"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {dishes.map((dish, index) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show ${dish.name}`}
              aria-current={index === active}
              className={`h-1.5 rounded-full transition-all ${
                index === active ? 'w-6 bg-gold-300' : 'w-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onAdd(current)}
          aria-label={`Add ${current.name} to cart`}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400 text-charcoal shadow-lg shadow-gold-500/20 transition-transform hover:-translate-y-0.5 hover:bg-gold-300"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
