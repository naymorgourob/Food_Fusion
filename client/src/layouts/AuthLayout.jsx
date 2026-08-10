import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowLeft } from 'lucide-react'
import { HERO_IMAGE, TESTIMONIALS } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

/**
 * Premium split-screen chrome for every authentication page (UI-09):
 * Login, Register, Forgot Password, Reset Password. Replaces the old
 * centred-card-on-plain-background layout.
 *
 * Left panel is presentational only (image, tagline, one real
 * testimonial reused from the landing page's own copy — not invented
 * here) and hides below `lg` so the form is never squeezed on a phone or
 * tablet. Right panel renders whichever auth page is routed via
 * `<Outlet />`, wrapped in the same fade/rise so switching between Login
 * and Register feels like one continuous flow rather than a hard cut.
 */
export default function AuthLayout() {
  const testimonial = TESTIMONIALS[0]

  return (
    <div className="grid min-h-screen bg-canvas font-sans lg:grid-cols-2">
      {/* --- Left: brand panel --------------------------------------- */}
      <div className="relative isolate hidden overflow-hidden lg:block">
        <img src={HERO_IMAGE.src} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-900/85 to-brand-800/70"
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-display text-base font-semibold text-gold-300 ring-1 ring-gold-500/40">
              F
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold text-white">FoodFusion</span>
              <span className="text-[0.6rem] tracking-[0.2em] text-gold-300 uppercase">Fine Dining</span>
            </span>
          </Link>

          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-gold-300" />
              <span className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
                Est. for the modern table
              </span>
            </span>
            <h2 className="max-w-md font-display text-3xl leading-tight font-semibold text-balance text-white xl:text-4xl">
              A seat is always warmer with an account.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Order ahead, track your table, and let the kitchen remember exactly how you like your
              evening.
            </p>
          </div>

          <figure className="max-w-sm rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <div className="mb-2 flex gap-0.5" aria-hidden>
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-white/85">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <img src={testimonial.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-white">{testimonial.name}</span>
                <span className="text-[0.7rem] text-white/55">{testimonial.role}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* --- Right: form panel ----------------------------------------- */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:justify-center lg:px-16 xl:px-20">
        <Link
          to={ROUTES.HOME}
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-body-muted transition-colors hover:text-brand-700 lg:hidden dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FoodFusion
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
