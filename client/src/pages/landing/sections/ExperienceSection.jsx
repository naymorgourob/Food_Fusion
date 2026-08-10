import { Sprout, HandHeart, Award } from 'lucide-react'
import { Container, Section, Reveal, Photo } from '@/components/landing/primitives'
import { AMBIENCE_IMAGE, CHEF_IMAGE } from '@/pages/landing/content'

const PILLARS = [
  { icon: Award, title: 'Quality', description: 'One menu, cooked properly. Nothing leaves the pass we would not serve a friend.' },
  { icon: Sprout, title: 'Freshness', description: 'Market produce every morning; the menu follows the season, not the other way round.' },
  { icon: HandHeart, title: 'Hospitality', description: 'Staff who remember your table, your allergy, and the wine you liked last time.' },
]

/**
 * Section 6 — the story. Split layout: photography carries the left, prose
 * the right. The second, smaller image overlaps the first to break the
 * rectangle and give the block some depth.
 */
export function ExperienceSection() {
  return (
    <Section tone="alt">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/20">
            <Photo
              src={AMBIENCE_IMAGE.src}
              alt={AMBIENCE_IMAGE.alt}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          {/* Overlapping chef portrait — hidden on small screens where there
              is no room for it to overlap anything gracefully. */}
          <div className="absolute -right-4 -bottom-10 hidden w-44 overflow-hidden rounded-2xl border-4 border-canvas-2 shadow-xl sm:block lg:-right-10 lg:w-52">
            <Photo
              src={CHEF_IMAGE.src}
              alt={CHEF_IMAGE.alt}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* Est. badge, anchored to the image's top-left corner. */}
          <div className="absolute -top-5 -left-4 flex flex-col items-center rounded-2xl bg-brand-700 px-5 py-4 shadow-xl shadow-brand-900/30 lg:-left-8">
            <span className="font-display text-2xl font-semibold text-gold-300">18</span>
            <span className="text-[0.65rem] tracking-wider text-white/70 uppercase">Years</span>
          </div>
        </Reveal>

        <div className="flex flex-col gap-7">
          <Reveal className="flex flex-col gap-4">
            <span className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold-500" />
              <span className="text-xs font-semibold tracking-[0.22em] text-gold-700 uppercase dark:text-gold-300">
                Our story
              </span>
            </span>
            <h2 className="font-display text-3xl leading-[1.15] font-semibold text-body text-balance sm:text-4xl">
              A dining room built for the long evening
            </h2>
            <p className="text-base leading-relaxed text-body-muted sm:text-lg">
              FoodFusion started as a twelve-seat kitchen with one rule: cook things properly and let
              people take their time. Eighteen years on the room is bigger, but the rule has not
              changed — seasonal produce, classical technique, and service that never rushes you
              toward the door.
            </p>
          </Reveal>

          <div className="flex flex-col gap-5">
            {PILLARS.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.08} className="flex gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-card text-brand-700 shadow-sm ring-1 ring-rule dark:text-brand-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-base font-semibold text-body">{title}</h3>
                  <p className="text-sm leading-relaxed text-body-muted">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
