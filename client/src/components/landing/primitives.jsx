import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

/**
 * The small, repeated pieces every landing section is assembled from.
 * Grouped in one file because each is a handful of lines — eight separate
 * files for eight one-function components would be worse to navigate, and
 * they're only ever used together.
 */

/** Fade-and-rise on first scroll into view. Plays once. */
export function Reveal({ children, delay = 0, className = '', y = 24 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Consistent horizontal rhythm for every section. */
export function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>
}

/**
 * Section shell. `tone` picks the background band — alternating canvas and
 * canvas-2 is what gives the page vertical rhythm without drawing rules
 * between every section.
 */
export function Section({ id, tone = 'canvas', className = '', children }) {
  const background = tone === 'alt' ? 'bg-canvas-2' : 'bg-canvas'
  return (
    <section id={id} className={`scroll-mt-24 py-20 sm:py-28 ${background} ${className}`}>
      {children}
    </section>
  )
}

/**
 * Eyebrow + heading + optional lead. `light` inverts it for use over
 * photography, where body/muted tokens would be invisible.
 */
export function SectionHeading({ eyebrow, title, lead, align = 'center', light = false, className = '' }) {
  const isCentre = align === 'center'
  return (
    <Reveal
      className={`flex max-w-2xl flex-col gap-4 ${isCentre ? 'mx-auto items-center text-center' : 'items-start text-left'} ${className}`}
    >
      {eyebrow && (
        <span className="flex items-center gap-3">
          <span className={`h-px w-8 ${light ? 'bg-gold-300' : 'bg-gold-500'}`} />
          <span
            className={`text-xs font-semibold tracking-[0.22em] uppercase ${light ? 'text-gold-300' : 'text-gold-700 dark:text-gold-300'}`}
          >
            {eyebrow}
          </span>
          {isCentre && <span className={`h-px w-8 ${light ? 'bg-gold-300' : 'bg-gold-500'}`} />}
        </span>
      )}
      <h2
        className={`font-display text-3xl leading-[1.15] font-semibold text-balance sm:text-4xl lg:text-[2.75rem] ${light ? 'text-white' : 'text-body'}`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`text-base leading-relaxed sm:text-lg ${light ? 'text-white/75' : 'text-body-muted'}`}>
          {lead}
        </p>
      )}
    </Reveal>
  )
}

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:opacity-60'

const BUTTON_SIZES = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-[0.95rem]',
}

// gold-500 only ever appears as a FILL here, never as text on a light
// surface — it measures 2.3:1 that way. Charcoal on gold is 7.1:1.
const BUTTON_VARIANTS = {
  primary: 'bg-brand-700 text-white shadow-lg shadow-brand-900/15 hover:-translate-y-0.5 hover:bg-brand-800',
  gold: 'bg-gold-500 text-charcoal shadow-lg shadow-gold-500/25 hover:-translate-y-0.5 hover:bg-gold-400',
  outline: 'border border-rule bg-card text-body hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400',
  ghostLight: 'border border-white/30 text-white backdrop-blur hover:bg-white/10',
}

export function Button({ as: As = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <As
      className={`${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

/**
 * <img> that degrades to a neutral tinted block instead of a broken-image
 * icon. Every photograph on this page is a remote URL, so a single dead
 * link would otherwise put a torn-page glyph in the middle of the design.
 */
export function Photo({ src, alt, className = '', imgClassName = '', ...props }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-canvas-2 ${className} ${imgClassName}`}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`}
      {...props}
    />
  )
}

/** Five stars with the numeric value beside them, for menu items and reviews. */
export function Rating({ value, showValue = true, size = 'sm' }) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`${starSize} ${i < Math.round(value) ? 'fill-gold-500 text-gold-500' : 'text-rule'}`}
          />
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold text-body-muted">{value.toFixed(1)}</span>}
      <span className="sr-only">{value.toFixed(1)} out of 5</span>
    </span>
  )
}

/**
 * Counts up to `value` when scrolled into view, once.
 *
 * requestAnimationFrame rather than a state-per-frame interval: the frame
 * loop writes through a ref and only commits to state at ~30fps, so a
 * 2-second count doesn't queue 120 React renders.
 */
export function Counter({ value, decimals = 0, suffix = '', duration = 1800 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  // Reduced motion is read once, here, rather than inside the effect: it's
  // a synchronous query, so starting at the final value skips the animation
  // entirely instead of setting state to correct it a moment later.
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [display, setDisplay] = useState(() => (reduceMotion ? value : 0))

  useEffect(() => {
    if (!inView || reduceMotion) return undefined

    let frame = 0
    const start = performance.now()
    let lastCommit = 0

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutCubic — fast start, gentle settle.
      const eased = 1 - Math.pow(1 - progress, 3)
      if (now - lastCommit > 33 || progress === 1) {
        setDisplay(value * eased)
        lastCommit = now
      }
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduceMotion, value, duration])

  return (
    <span ref={ref} className="font-display text-4xl font-semibold text-body sm:text-5xl">
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
