import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Clock, Flame } from 'lucide-react'
import { Container, Button, Rating, Photo } from '@/components/landing/primitives'
import { HERO_IMAGE } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

const STATS = [
  { value: '25+', label: 'Signature dishes' },
  { value: '18', label: 'Years of service' },
  { value: '30 min', label: 'Average delivery' },
]

/**
 * Section 2 — full-bleed hero.
 *
 * The photograph is the design here, so it gets the whole viewport rather
 * than a column: a dark scrim over it keeps every piece of white text well
 * above AA, and the copy sits on the left where the plating is emptiest.
 */
export function HeroSection() {
  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {/* Background photograph + scrim. The gradient runs left-heavy so the
          text side is darkest and the food stays legible on the right. */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <Photo src={HERO_IMAGE.src} alt="" className="h-full w-full object-cover" fetchPriority="high" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-900/45"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/70 via-transparent to-brand-900/40" />

      <Container className="grid items-center gap-14 pt-28 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-7"
        >
          <span className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold-300" />
            <span className="text-xs font-semibold tracking-[0.22em] text-gold-300 uppercase">
              Modern fine dining
            </span>
          </span>

          <h1 className="font-display text-4xl leading-[1.08] font-semibold text-white text-balance sm:text-5xl lg:text-6xl">
            Where every plate is
            <span className="block text-gold-300">worth the table.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Seasonal ingredients, a chef-led kitchen, and a dining room built for long evenings.
            Order in, or reserve your table — both take under a minute.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button as={Link} to={`${ROUTES.ORDERS}/new`} variant="gold" size="lg" className="group">
              Order now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button as="a" href="#reserve" variant="ghostLight" size="lg">
              <CalendarCheck className="h-4 w-4" />
              Reserve a table
            </Button>
          </div>

          {/* Rating uses gold stars on a dark scrim — the numeral and label
              are white, so nothing depends on the gold for legibility. */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <span className="flex items-center gap-2">
              <span className="flex" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-gold-300">
                    <path d="M10 1l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.4 4.8 17.1l1-5.8L1.5 7.2l5.9-.9L10 1z" />
                  </svg>
                ))}
              </span>
              <span className="text-sm font-semibold text-white">4.9</span>
              <span className="text-sm text-white/65">from 2,400+ guests</span>
            </span>
          </div>

          <dl className="mt-2 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-7">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="font-display text-2xl font-semibold text-white">{value}</dt>
                <dd className="text-xs text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Floating cards. Hidden below lg, where they'd cover the food. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative hidden h-[26rem] lg:block"
        >
          <FloatingCard
            className="absolute top-4 right-4"
            delay={0}
            icon={Flame}
            title="Chef's signature"
            subtitle="Black Truffle Burger"
            trailing={<Rating value={4.9} showValue={false} />}
          />
          <FloatingCard
            className="absolute right-24 bottom-24"
            delay={0.6}
            icon={Clock}
            title="Tonight's service"
            subtitle="Tables from 6:30 PM"
            trailing={
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-700">
                12 left
              </span>
            }
          />
        </motion.div>
      </Container>
    </section>
  )
}

function FloatingCard({ className = '', delay, icon: Icon, title, subtitle, trailing }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-2xl shadow-brand-900/25 backdrop-blur ${className}`}
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.7rem] font-medium tracking-wide text-charcoal-faint uppercase">
          {title}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap text-charcoal">{subtitle}</span>
      </div>
      <div className="pl-1">{trailing}</div>
    </motion.div>
  )
}
