import { Link } from 'react-router-dom'
import { UtensilsCrossed, Bike, ShoppingBag, ArrowRight } from 'lucide-react'
import { Container, Section, Reveal } from '@/components/landing/primitives'
import { ROUTES } from '@/constants'

// Mirrors the three OrderType values the backend already accepts, so each
// card is a real entry point into the existing ordering flow rather than
// marketing decoration.
const SERVICES = [
  {
    icon: UtensilsCrossed,
    title: 'Dine-In',
    description: 'Reserve a table and let the kitchen time each course to your arrival.',
    cta: 'Reserve a table',
    to: '#reserve',
  },
  {
    icon: Bike,
    title: 'Delivery',
    description: 'Hot to your door in about 30 minutes, tracked live from pass to doorstep.',
    cta: 'Order delivery',
    to: `${ROUTES.ORDERS}/new`,
  },
  {
    icon: ShoppingBag,
    title: 'Takeaway',
    description: 'Order ahead, pick a collection time, and walk straight past the queue.',
    cta: 'Order takeaway',
    to: `${ROUTES.ORDERS}/new`,
  },
]

/**
 * Section 3. Sits deliberately high on the page — a diner's first question
 * is "how do I get this food", and answering it immediately below the hero
 * is worth more than another block of prose.
 */
export function ServicesSection() {
  return (
    <Section className="-mt-20 !py-0">
      <Container>
        <div className="grid gap-5 sm:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, description, cta, to }, index) => {
            const isInternal = to.startsWith('/')
            const Wrapper = isInternal ? Link : 'a'
            const linkProps = isInternal ? { to } : { href: to }

            return (
              <Reveal key={title} delay={index * 0.08}>
                <Wrapper
                  {...linkProps}
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-rule bg-card p-7 shadow-xl shadow-brand-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-900/10"
                >
                  {/* Emerald wash that rises from the bottom on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-brand-50 to-transparent transition-all duration-300 group-hover:h-full dark:from-brand-900/30"
                  />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="relative font-display text-xl font-semibold text-body">{title}</h3>
                  <p className="relative flex-1 text-sm leading-relaxed text-body-muted">{description}</p>
                  <span className="relative flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400">
                    {cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Wrapper>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
