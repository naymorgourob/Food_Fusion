import { Link } from 'react-router-dom'
import { Search, X, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { HERO_IMAGE } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

/**
 * Menu banner: breadcrumb, slogan, and the primary search field (UI-03).
 *
 * The search input is uncontrolled-feeling but fully controlled — the
 * parent debounces it before hitting the API, so typing stays responsive
 * without a request per keystroke.
 *
 * Note on scope: the backend's menu search matches dish name and category
 * name (see listMenuItems). It does not index ingredients, because there
 * is no ingredients column — so the placeholder promises only what the
 * API can actually deliver.
 */
export function MenuHero({ search, onSearchChange, onOpenFilters, activeFilterCount }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      <img
        src={HERO_IMAGE.src}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900/95 via-brand-900/85 to-brand-800/70"
      />

      <div className="flex flex-col gap-6 px-6 py-9 sm:px-10 sm:py-12">
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
              Menu
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="h-px w-7 bg-gold-300" />
            <span className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
              Our Kitchen
            </span>
          </span>
          <h1 className="max-w-2xl font-display text-3xl leading-tight font-semibold text-balance text-white sm:text-4xl lg:text-5xl">
            Every dish, made to order.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Seasonal produce, a wood-fired grill, and a kitchen that plates each course the moment
            you ask for it.
          </p>
        </div>

        {/* --- Search + filter trigger ------------------------------------ */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-charcoal-faint"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="What would you like to eat today?"
              aria-label="Search the menu by dish or category"
              className="h-14 w-full rounded-full border border-white/20 bg-white/95 pr-12 pl-13 text-sm text-charcoal shadow-xl placeholder:text-charcoal-faint focus:border-gold-400 focus:ring-4 focus:ring-gold-500/25 focus:outline-none dark:bg-card dark:text-body"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-4 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-charcoal-faint transition-colors hover:bg-canvas-2 hover:text-charcoal dark:hover:text-body"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex h-14 flex-none items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[0.65rem] font-bold text-charcoal">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
