import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, MessageCircle, Rss, Share2 } from 'lucide-react'
import { Container } from '@/components/landing/primitives'
import { OPENING_HOURS, CONTACT } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

const NAV_LINKS = [
  { label: 'Menu', href: '#menu' },
  { label: 'Reservations', href: '#reserve' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
]

// Placeholder destinations — real social accounts don't exist yet. Generic
// icons rather than brand logos: this version of lucide-react dropped the
// trademarked brand glyphs entirely.
const SOCIALS = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'Community' },
  { icon: Rss, label: 'Updates' },
  { icon: Share2, label: 'Share' },
]

/** Section 14 — footer. Deep emerald, so the page closes on the brand colour. */
export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 bg-brand-900 text-white">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-display text-sm font-semibold text-gold-300 ring-1 ring-gold-500/40">
              F
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold text-white">FoodFusion</span>
              <span className="text-[0.6rem] tracking-[0.2em] text-gold-300 uppercase">Fine Dining</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            Seasonal, chef-led cooking in a room built for long evenings. Dine in, collect, or have
            it brought to your door.
          </p>
          <div className="flex gap-2.5">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#contact"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-300/50 hover:bg-white/5 hover:text-gold-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Explore
          </h3>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/65 transition-colors hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
          <Link to={ROUTES.LOGIN} className="text-sm text-white/65 transition-colors hover:text-gold-300">
            Login
          </Link>
        </div>

        <div className="flex flex-col gap-3.5">
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Opening hours
          </h3>
          {OPENING_HOURS.map(({ days, hours }) => (
            <div key={days} className="flex flex-col gap-0.5">
              <span className="text-sm text-white/80">{days}</span>
              <span className="font-mono text-xs text-gold-300">{hours}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3.5">
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Find us
          </h3>
          <a
            href={CONTACT.mapSrc}
            className="flex items-start gap-2.5 text-sm text-white/65 transition-colors hover:text-gold-300"
          >
            <MapPin className="mt-0.5 h-4 w-4 flex-none" />
            {CONTACT.address}
          </a>
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-2.5 text-sm text-white/65 transition-colors hover:text-gold-300"
          >
            <Phone className="h-4 w-4 flex-none" />
            {CONTACT.phone}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-2.5 text-sm text-white/65 transition-colors hover:text-gold-300"
          >
            <Mail className="h-4 w-4 flex-none" />
            {CONTACT.email}
          </a>

          <div className="mt-1 overflow-hidden rounded-xl border border-white/10">
            <iframe
              src={CONTACT.mapSrc}
              title="FoodFusion location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-36 w-full grayscale-[0.4]"
            />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container>
          <p className="text-center text-xs text-white/45">
            © {new Date().getFullYear()} FoodFusion. Built as a university software development
            project.
          </p>
        </Container>
      </div>
    </footer>
  )
}
