import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Clock, Users, Sparkles } from 'lucide-react'
import { Container, Reveal, Button, Photo } from '@/components/landing/primitives'
import { AMBIENCE_IMAGE } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

// Values match the ReservationOccasion enum on the backend exactly, so the
// choice made here survives the hand-off into the real booking form.
const OCCASIONS = [
  { value: '', label: 'No occasion' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'FAMILY_DINNER', label: 'Family dinner' },
  { value: 'BUSINESS_MEETING', label: 'Business meeting' },
  { value: 'DATE', label: 'Date' },
  { value: 'OTHER', label: 'Something else' },
]

function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const FIELD_CLASSES =
  'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur transition-colors placeholder:text-white/50 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/40 [color-scheme:dark]'

/**
 * Section 7 — reservation.
 *
 * This is a *pre-fill*, not a second booking implementation: the details
 * are carried as query params into the existing /reservations page, which
 * owns validation, availability, and auth. Duplicating that logic here
 * would mean two sources of truth for the same rules.
 */
export function ReservationSection() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ date: '', time: '19:00', guests: '2', occasion: '' })

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (form.date) params.set('date', form.date)
    if (form.time) params.set('time', form.time)
    if (form.guests) params.set('guests', form.guests)
    if (form.occasion) params.set('occasion', form.occasion)
    navigate(`${ROUTES.RESERVATIONS}?${params.toString()}`)
  }

  return (
    <section id="reserve" className="relative isolate scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-20">
        <Photo src={AMBIENCE_IMAGE.src} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-brand-900/88" />

      <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <span className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold-300" />
            <span className="text-xs font-semibold tracking-[0.22em] text-gold-300 uppercase">
              Reservations
            </span>
          </span>
          <h2 className="font-display text-3xl leading-[1.15] font-semibold text-white text-balance sm:text-4xl">
            Book the table. We&apos;ll handle the evening.
          </h2>
          <p className="text-base leading-relaxed text-white/75">
            Tell us when you are coming and what you are celebrating — the kitchen times your first
            course to your arrival, and the floor team will have the table dressed for the occasion.
          </p>
          <ul className="flex flex-col gap-2.5 pt-2">
            {['Instant confirmation', 'Free to cancel up to 2 hours before', 'Occasion noted for the floor team'].map(
              (line) => (
                <li key={line} className="flex items-center gap-2.5 text-sm text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
                  {line}
                </li>
              ),
            )}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-3xl border border-white/15 bg-white/8 p-7 shadow-2xl shadow-brand-900/40 backdrop-blur-xl sm:p-9"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
                  <CalendarCheck className="h-3.5 w-3.5" /> Date
                </span>
                <input
                  type="date"
                  min={todayIso()}
                  value={form.date}
                  onChange={update('date')}
                  className={FIELD_CLASSES}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
                  <Clock className="h-3.5 w-3.5" /> Time
                </span>
                <input type="time" value={form.time} onChange={update('time')} className={FIELD_CLASSES} required />
              </label>

              <label className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
                  <Users className="h-3.5 w-3.5" /> Guests
                </span>
                <select value={form.guests} onChange={update('guests')} className={FIELD_CLASSES}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n} className="text-charcoal">
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
                  <Sparkles className="h-3.5 w-3.5" /> Occasion
                </span>
                <select value={form.occasion} onChange={update('occasion')} className={FIELD_CLASSES}>
                  {OCCASIONS.map((occasion) => (
                    <option key={occasion.label} value={occasion.value} className="text-charcoal">
                      {occasion.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full">
              Reserve a table
            </Button>
            <p className="text-center text-xs text-white/55">
              You will confirm the details on the next step.
            </p>
          </form>
        </Reveal>
      </Container>
    </section>
  )
}
