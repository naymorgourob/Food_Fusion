import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container, Section, SectionHeading, Reveal, Rating, Photo } from '@/components/landing/primitives'
import { TESTIMONIALS } from '@/pages/landing/content'

/**
 * Section 10 — testimonial slider.
 *
 * Manual controls only, no autoplay: a carousel that moves on its own
 * takes the text away mid-sentence, and pausing it correctly for keyboard
 * and screen-reader users is more machinery than three quotes justify.
 */
export function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const current = TESTIMONIALS[index]

  const go = (delta) =>
    setIndex((i) => (i + delta + TESTIMONIALS.length) % TESTIMONIALS.length)

  return (
    <Section>
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow="Guest reviews" title="What our guests say" />

        <Reveal className="mx-auto w-full max-w-3xl">
          <div className="relative rounded-[2rem] border border-rule bg-card p-8 shadow-xl shadow-brand-900/5 sm:p-12">
            <Quote className="absolute top-8 right-8 h-12 w-12 text-brand-50 dark:text-brand-900/50" />

            {/* aria-live so a screen reader announces the new quote when the
                arrows or dots change it. */}
            <div className="relative min-h-[15rem] sm:min-h-[13rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={current.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-6"
                >
                  <Rating value={current.rating} showValue={false} size="md" />
                  <blockquote className="font-display text-lg leading-relaxed font-medium text-body text-balance sm:text-xl">
                    “{current.quote}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <Photo
                      src={current.avatar}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-300"
                    />
                    <span className="flex flex-col">
                      <span className="font-display text-sm font-semibold text-body">{current.name}</span>
                      <span className="text-xs text-body-faint">{current.role}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-6">
              <div className="flex gap-2">
                {TESTIMONIALS.map((testimonial, i) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show review ${i + 1} of ${TESTIMONIALS.length}`}
                    aria-current={i === index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? 'w-8 bg-brand-700 dark:bg-brand-400' : 'w-2 bg-rule hover:bg-brand-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous review"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-rule text-body-muted transition-colors hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next review"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-rule text-body-muted transition-colors hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
