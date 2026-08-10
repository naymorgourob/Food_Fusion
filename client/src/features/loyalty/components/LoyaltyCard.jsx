import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Gift, ArrowRight } from 'lucide-react'
import { MembershipBadge } from '@/features/loyalty/components/MembershipBadge'
import { Skeleton } from '@/components/customer/ui'
import { ROUTES } from '@/constants'

function Stat({ label, value, emphasis = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.7rem] font-medium tracking-wide text-white/55 uppercase">{label}</span>
      <span className={`font-display font-semibold ${emphasis ? 'text-3xl text-gold-300' : 'text-xl text-white'}`}>
        {value}
      </span>
    </div>
  )
}

/**
 * The loyalty summary: balance, lifetime totals, tier badge, and progress
 * toward the next tier. Shared by the dashboard and LoyaltyPage — one
 * component, so the two can't drift apart.
 *
 * Rendered as a dark emerald panel rather than a plain white card: this is
 * a rewards balance, and giving it the brand's "premium" surface is what
 * separates it visually from the ordinary list cards around it.
 */
export function LoyaltyCard({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-brand-800 p-6">
        <Skeleton className="h-4 w-32 opacity-20" />
        <Skeleton className="h-9 w-24 opacity-20" />
        <Skeleton className="h-2 w-full opacity-20" />
        <span className="sr-only">Loading loyalty points…</span>
      </div>
    )
  }

  const { currentPoints, totalEarned, totalRedeemed, membershipLevel, nextTier } = summary

  // Progress within the current tier band, so the bar fills as the customer
  // approaches the next level rather than from an absolute zero.
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((nextTier.minPoints - nextTier.pointsAway) / nextTier.minPoints) * 100))
    : 100

  return (
    <section
      aria-labelledby="loyalty-heading"
      className="relative isolate overflow-hidden rounded-3xl bg-brand-800 p-6 text-white shadow-xl shadow-brand-900/20"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-14 -z-10 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
            <Sparkles className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
          </span>
          <h2 id="loyalty-heading" className="font-display text-base font-semibold">
            Loyalty Rewards
          </h2>
        </div>
        <MembershipBadge level={membershipLevel} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Stat label="Available" value={currentPoints} emphasis />
        <Stat label="Earned" value={totalEarned} />
        <Stat label="Redeemed" value={totalRedeemed} />
      </div>

      {nextTier && (
        <div className="mt-5 flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            aria-label={`Progress to ${nextTier.level}`}
            className="h-2 w-full overflow-hidden rounded-full bg-white/15"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300"
            />
          </div>
          <p className="text-xs text-white/65">
            <span className="font-semibold text-white">{nextTier.pointsAway}</span> more points to reach{' '}
            {nextTier.level.charAt(0) + nextTier.level.slice(1).toLowerCase()}.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to={`${ROUTES.ORDERS}/new`}
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
        >
          <Gift className="h-4 w-4" />
          Redeem points
        </Link>
        <Link
          to={ROUTES.LOYALTY}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 transition-colors hover:text-white"
        >
          Point history
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}
