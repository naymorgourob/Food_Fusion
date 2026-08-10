import { Leaf, ChefHat, Bike, Radar, Gift, Sparkles } from 'lucide-react'
import { Container, Section, SectionHeading, Reveal } from '@/components/landing/primitives'

const REASONS = [
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'Produce delivered each morning from growers we have worked with for years.',
  },
  {
    icon: ChefHat,
    title: 'Expert Chefs',
    description: 'A brigade trained in classical technique, cooking a menu that changes with the season.',
  },
  {
    icon: Bike,
    title: 'Fast Delivery',
    description: 'Our own riders, insulated boxes, and a 30-minute average across the city.',
  },
  {
    icon: Radar,
    title: 'Live Order Tracking',
    description: 'Watch your order move from accepted to preparing to on-the-way, in real time.',
  },
  {
    icon: Gift,
    title: 'Loyalty Rewards',
    description: 'Earn points on every completed order and spend them straight off your next bill.',
  },
  {
    icon: Sparkles,
    title: 'Premium Dining',
    description: 'A room designed for long dinners — quiet corners, warm light, unhurried service.',
  },
]

/** Section 4 — six reasons, on the alternate band for vertical rhythm. */
export function WhyChooseSection() {
  return (
    <Section id="about" tone="alt">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Why FoodFusion"
          title="Six reasons guests keep coming back"
          lead="Every one of these is something you can feel at the table, not a line on a brochure."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06} className="h-full">
              <article className="group flex h-full flex-col gap-4 rounded-3xl border border-rule bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl hover:shadow-brand-900/8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-gold-100 group-hover:text-gold-700 dark:bg-brand-900/40 dark:text-brand-400 dark:group-hover:bg-gold-100/10 dark:group-hover:text-gold-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-lg font-semibold text-body">{title}</h3>
                <p className="text-sm leading-relaxed text-body-muted">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
