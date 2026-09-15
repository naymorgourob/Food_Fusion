import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/**
 * The repeated shapes every customer-dashboard section is built from.
 * One file because each is small and they're always used together.
 */

/** Standard white card. `interactive` adds the lift-on-hover treatment. */
export function Card({ as: As = 'div', className = '', interactive = false, children, ...props }) {
  return (
    <As
      className={`rounded-2xl border border-rule bg-card ${
        interactive
          ? 'transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/8'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}

/** Section header with an optional "see all" link on the right. */
export function SectionTitle({ children, action, to }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-lg font-semibold text-body">{children}</h2>
      {action && to && (
        <Link
          to={to}
          className="group flex flex-none items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

/** Shimmering placeholder block. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden />
}

/** A card-shaped stack of skeleton lines, for loading list sections. */
export function SkeletonCard({ lines = 3 }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-full" />
      ))}
      <span className="sr-only">Loading…</span>
    </Card>
  )
}

/**
 * Illustrated empty state. The "illustration" is a tinted icon medallion
 * built from the design tokens rather than an image file — it themes
 * correctly in dark mode and adds nothing to the bundle.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, to, onAction, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-card/50 text-center ${
        compact ? 'px-5 py-8' : 'px-6 py-12'
      }`}
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-900/40" />
        <span className="absolute inset-2 rounded-full bg-gold-100 dark:bg-gold-100/10" />
        <Icon className="relative h-6 w-6 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-semibold text-body">{title}</p>
        {description && <p className="max-w-xs text-sm text-body-muted">{description}</p>}
      </div>
      {actionLabel && (to || onAction) &&
        (onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            to={to}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
    </div>
  )
}

/** Fade-and-rise wrapper, staggered by index at the call site. */
export function Rise({ delay = 0, className = '', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
