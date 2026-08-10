import { Container, Section, Reveal, Counter } from '@/components/landing/primitives'

const STATS = [
  { value: 24500, suffix: '+', label: 'Happy customers' },
  { value: 86000, suffix: '+', label: 'Orders served' },
  { value: 120, suffix: '', label: 'Menu items' },
  { value: 4.9, decimals: 1, suffix: '', label: 'Average rating' },
]

/** Section 12 — animated counters, each starting when scrolled into view. */
export function StatsSection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 rounded-[2rem] border border-rule bg-card px-8 py-12 shadow-xl shadow-brand-900/5 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
          {STATS.map(({ value, suffix, decimals, label }, index) => (
            <Reveal key={label} delay={index * 0.08} className="flex flex-col items-center gap-2 text-center">
              <Counter value={value} suffix={suffix} decimals={decimals} />
              <span className="h-px w-10 bg-gold-500" />
              <span className="text-sm font-medium text-body-muted">{label}</span>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
