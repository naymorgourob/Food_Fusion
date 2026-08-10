import { Link } from 'react-router-dom'
import { Coins, Gift, Crown, ArrowRight } from 'lucide-react'
import { Container, Section, Reveal, Button } from '@/components/landing/primitives'
import { ROUTES } from '@/constants'

const PERKS = [
  {
    icon: Coins,
    title: 'Earn points',
    description: 'Every completed order earns points automatically — nothing to scan or remember.',
  },
  {
    icon: Gift,
    title: 'Redeem rewards',
    description: 'Spend points straight off your bill at checkout, from your very first reward.',
  },
  {
    icon: Crown,
    title: 'Member benefits',
    description: 'Climb from Bronze to Platinum for priority tables and seasonal tasting invites.',
  },
]

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum']

/**
 * Section 9 — loyalty. Mirrors what the loyalty module actually does
 * (earn on completion, redeem at checkout, four tiers), so a guest who
 * signs up finds exactly what was promised here.
 */
export function LoyaltySection() {
  return (
    <Section tone="alt">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-800 px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
            {/* Gold bloom, top-right, keeping the panel from reading flat. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 -z-10 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #FFF 1px, transparent 1px), linear-gradient(to bottom, #FFF 1px, transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />

            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
              <div className="flex flex-col gap-6">
                <span className="flex items-center gap-3">
                  <span className="h-px w-8 bg-gold-300" />
                  <span className="text-xs font-semibold tracking-[0.22em] text-gold-300 uppercase">
                    Loyalty programme
                  </span>
                </span>
                <h2 className="font-display text-3xl leading-[1.15] font-semibold text-white text-balance sm:text-4xl">
                  Eat well. Get rewarded for it.
                </h2>
                <p className="text-base leading-relaxed text-white/75">
                  Join once and every order counts toward your next one. No card, no app — points
                  land on your account the moment an order is completed.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {TIERS.map((tier, index) => (
                    <span key={tier} className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          index === TIERS.length - 1
                            ? 'bg-gold-500 text-charcoal'
                            : 'bg-white/10 text-white/80'
                        }`}
                      >
                        {tier}
                      </span>
                      {index < TIERS.length - 1 && <span className="text-white/30">→</span>}
                    </span>
                  ))}
                </div>

                <div className="pt-3">
                  <Button as={Link} to={ROUTES.REGISTER} variant="gold" size="lg" className="group">
                    Join the programme
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {PERKS.map(({ icon: Icon, title, description }, index) => (
                  <Reveal
                    key={title}
                    delay={index * 0.08}
                    className="flex gap-4 rounded-2xl border border-white/12 bg-white/[0.07] p-5 backdrop-blur"
                  >
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
                      <p className="text-sm leading-relaxed text-white/70">{description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
