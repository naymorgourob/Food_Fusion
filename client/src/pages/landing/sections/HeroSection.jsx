import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { ArrowRight, CalendarCheck, Clock } from 'lucide-react'
import { Container, Button, Photo } from '@/components/landing/primitives'
import { useMenuItems } from '@/features/menu/hooks/useMenuItems'
import { pickSpecial } from '@/features/menu/utils/special'
import { SUGGESTED_TIMES } from '@/features/reservations/constants'
import { STOREFRONT_IMAGE } from '@/pages/landing/content'
import { ROUTES, getMenuImageUrl } from '@/constants'
import { money } from '@/utils/format'

const CHEF_PICK_PARAMS = { isAvailable: 'true', tag: 'chef', sortBy: 'name', page: 1, pageSize: 50 }

function formatSlot(value) {
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// The next booking slot the reservation form actually offers: before
// dinner starts it's "from" the first dinner slot, during service it's the
// next slot still ahead, and after the last slot it's tomorrow's first.
function nextService(now = new Date()) {
  const toMinutes = (slot) => Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3))
  const current = now.getHours() * 60 + now.getMinutes()
  const dinner = SUGGESTED_TIMES.filter((slot) => toMinutes(slot) >= 17 * 60)
  if (current < toMinutes(dinner[0])) {
    return { title: "Tonight's service", subtitle: `Dinner from ${formatSlot(dinner[0])}` }
  }
  const upcoming = dinner.find((slot) => toMinutes(slot) > current)
  if (upcoming)
    return { title: "Tonight's service", subtitle: `Next table at ${formatSlot(upcoming)}` }
  return { title: "Tomorrow's service", subtitle: `Tables from ${formatSlot(SUGGESTED_TIMES[0])}` }
}

const STATS = [
  { value: '25+', label: 'Signature dishes' },
  { value: '18', label: 'Years of service' },
  { value: '30 min', label: 'Average delivery' },
]

/**
 * Section 2 — full-bleed hero.
 *
 * The storefront photograph is the design here, so it gets the whole
 * viewport: the scrim is dark on the left, behind the copy, and nearly
 * clear on the right so the lantern-lit windows and terrace show through.
 */
export function HeroSection() {
  const { items: chefPicks } = useMenuItems(CHEF_PICK_PARAMS)
  const signature = useMemo(() => pickSpecial(chefPicks), [chefPicks])
  const service = nextService()

  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {/* Background photograph + scrim. The gradient runs left-heavy so the
          text side is darkest and the food stays legible on the right. */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <Photo
          src={STOREFRONT_IMAGE.src}
          alt=""
          className="h-full w-full object-cover object-[60%_center]"
          fetchPriority="high"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900/95 via-brand-900/70 to-brand-900/5"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/80 via-transparent to-brand-900/50"
      />

      <Container className="grid items-center gap-14 pt-36 pb-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-7"
        >
          <span className="flex items-center gap-3">
            <span className="h-px w-12 bg-gold-300" />
            <span className="text-sm font-semibold tracking-[0.3em] text-gold-300 uppercase">
              Modern fine dining
            </span>
          </span>

          <h1 className="font-display text-5xl leading-[1.02] font-semibold tracking-tight text-white text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl xl:text-8xl">
            Where every plate is
            <span className="font-menu mt-1 block text-[1.12em] font-semibold text-gold-300 italic">
              worth the table.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Seasonal ingredients, a chef-led kitchen, and a dining room built for long evenings.
            Order in, or reserve your table — both take under a minute.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              as={Link}
              to={`${ROUTES.ORDERS}/new`}
              variant="gold"
              size="lg"
              className="group"
            >
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

          <dl className="mt-2 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-7">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="font-display text-3xl font-semibold text-white sm:text-4xl">
                  {value}
                </dt>
                <dd className="text-sm text-white/70">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Floating cards, both live: today's chef's pick from the real menu
            (it opens that dish to order) and the next bookable service,
            which jumps to the reservation form. Hidden below lg. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative hidden h-[26rem] lg:block"
        >
          {signature && (
            <FloatingCard
              as={Link}
              to={`${ROUTES.ORDERS}/new?q=${encodeURIComponent(signature.name)}`}
              className="absolute top-4 right-4"
              delay={0}
              media={<DishThumb dish={signature} />}
              title="Chef's signature"
              subtitle={signature.name}
              trailing={
                <span className="font-display text-lg font-semibold whitespace-nowrap text-brand-700">
                  {money(signature.price)}
                </span>
              }
            />
          )}
          <FloatingCard
            as="a"
            href="#reserve"
            className="absolute right-24 bottom-24"
            delay={0.6}
            icon={Clock}
            title={service.title}
            subtitle={service.subtitle}
            trailing={
              <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-brand-700">
                Book →
              </span>
            }
          />
        </motion.div>
      </Container>
    </section>
  )
}

function DishThumb({ dish }) {
  const { primary, fallback } = getMenuImageUrl(dish)
  return (
    <Photo
      src={primary || fallback}
      alt=""
      className="h-14 w-14 flex-none rounded-2xl object-cover ring-1 ring-black/5"
    />
  )
}

function FloatingCard({
  as: Component = 'div',
  className = '',
  delay,
  icon: Icon,
  media,
  title,
  subtitle,
  trailing,
  ...props
}) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
      className={className}
    >
      <Component
        {...props}
        className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/95 px-5 py-4 shadow-2xl shadow-brand-900/25 backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-gold-300/60 focus-visible:outline-none"
      >
        {media ?? (
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium tracking-wide whitespace-nowrap text-charcoal-faint uppercase">
            {title}
          </span>
          <span className="font-display text-lg font-semibold whitespace-nowrap text-charcoal">
            {subtitle}
          </span>
        </div>
        <div className="pl-1">{trailing}</div>
      </Component>
    </motion.div>
  )
}
