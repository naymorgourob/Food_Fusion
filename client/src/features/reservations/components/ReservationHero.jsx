import { CalendarPlus, ChevronRight, Clock, ChefHat, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AMBIENCE_IMAGE } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

/**
 * Reservation page banner (UI-06) plus the scheduled dine-in explainer.
 *
 * The explainer is here rather than buried lower because "pre-order so
 * your food is ready when you sit down" is the feature most people don't
 * know exists — and it is genuinely implemented (Order.scheduledArrivalTime
 * plus the kitchen lead time in getScheduledDineInTimes), so it's worth
 * the space.
 */
export function ReservationHero({ onStart }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      <img
        src={AMBIENCE_IMAGE.src}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900/95 via-brand-900/85 to-brand-800/65"
      />

      <div className="flex flex-col gap-7 px-6 py-9 sm:px-10 sm:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <li>
              <Link to={ROUTES.ACCOUNT} className="transition-colors hover:text-white">
                Dashboard
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-gold-300">
              Reservations
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="h-px w-7 bg-gold-300" />
            <span className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
              The Dining Room
            </span>
          </span>
          <h1 className="max-w-2xl font-display text-3xl leading-tight font-semibold text-balance text-white sm:text-4xl lg:text-5xl">
            Reserve your table
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Twenty-eight covers, one seating at a time. Choose your evening and we&rsquo;ll have the
            room ready for you.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
          >
            <CalendarPlus className="h-4 w-4" />
            Book a table
          </button>
        </div>

        {/* --- Scheduled dine-in explainer -------------------------- */}
        <div className="grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
          {[
            { icon: Clock, title: 'Pick your arrival', body: 'Tell us when you plan to walk in.' },
            { icon: ChefHat, title: 'We start early', body: 'The kitchen begins before you arrive.' },
            { icon: Utensils, title: 'Eat straight away', body: 'Your first course lands as you sit.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 text-gold-300">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">{title}</span>
                <span className="text-xs text-white/60">{body}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
