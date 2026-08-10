import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { Container, Section, Reveal, Button } from '@/components/landing/primitives'

/**
 * Section 13 — newsletter.
 *
 * There is no mailing-list backend in this project, and inventing an
 * endpoint would be out of scope for a landing-page redesign. So this
 * validates the address and confirms locally — honest about what it does,
 * with one obvious place (handleSubmit) to POST from once a list exists.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <Section tone="alt">
      <Container>
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/20">
            <Mail className="h-6 w-6" strokeWidth={1.75} />
          </span>

          <h2 className="font-display text-3xl leading-[1.15] font-semibold text-body text-balance sm:text-4xl">
            Seasonal menus, first
          </h2>
          <p className="text-base leading-relaxed text-body-muted">
            One email a month: what has just come into season, and when the next tasting evening
            opens for booking. No more than that.
          </p>

          {submitted ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-400"
            >
              <Check className="h-4 w-4" />
              Thanks — we&apos;ll be in touch at {email}.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-full border border-rule bg-card px-5 py-3 text-sm text-body transition-colors placeholder:text-body-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <Button type="submit" variant="primary">
                Subscribe
              </Button>
            </form>
          )}
        </Reveal>
      </Container>
    </Section>
  )
}
