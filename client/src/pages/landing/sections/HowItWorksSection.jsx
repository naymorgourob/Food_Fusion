import { BookOpen, ShoppingBag, ChefHat, Radar, Utensils } from 'lucide-react'
import { Container, Section, SectionHeading, Reveal } from '@/components/landing/primitives'

const STEPS = [
  { icon: BookOpen, title: 'Choose Food', description: 'Browse the menu and build your order.' },
  { icon: ShoppingBag, title: 'Place Order', description: 'Dine-in, delivery, or takeaway — your call.' },
  { icon: ChefHat, title: 'Chef Prepares', description: 'Straight to the pass, cooked to order.' },
  { icon: Radar, title: 'Track Order', description: 'Live status from accepted to on-the-way.' },
  { icon: Utensils, title: 'Enjoy Food', description: 'At your table or at your door, still hot.' },
]

/**
 * Section 8 — five-step timeline.
 *
 * The connector is one absolutely-positioned line behind the row rather
 * than a divider between each pair: a single line stays perfectly straight
 * regardless of how the step text wraps.
 */
export function HowItWorksSection() {
  return (
    <Section>
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="How it works"
          title="From craving to first bite, in five steps"
        />

        <div className="relative">
          {/* Desktop connector — sits at the vertical centre of the icons. */}
          <span
            aria-hidden
            className="absolute top-9 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-rule to-transparent lg:block"
          />

          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              // The <li> is the direct child of <ol>, with Reveal inside it —
              // wrapping the other way round would put a <div> between them
              // and break the list semantics for assistive tech.
              <li key={title} className="contents">
                <Reveal
                  delay={index * 0.1}
                  className="flex gap-5 lg:flex-col lg:items-center lg:gap-4 lg:text-center"
                >
                  <span className="relative flex h-[4.5rem] w-[4.5rem] flex-none items-center justify-center rounded-full border border-rule bg-card text-brand-700 shadow-lg shadow-brand-900/8 dark:text-brand-400">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                    <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 font-display text-xs font-semibold text-charcoal shadow-md">
                      {index + 1}
                    </span>
                  </span>
                  <div className="flex flex-col gap-1.5 pt-2 lg:pt-0">
                    <h3 className="font-display text-base font-semibold text-body">{title}</h3>
                    <p className="text-sm leading-relaxed text-body-muted">{description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}
