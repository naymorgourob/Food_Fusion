import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Plus, ArrowRight } from 'lucide-react'
import { Container, Section, SectionHeading, Reveal, Rating, Button, Photo } from '@/components/landing/primitives'
import { MENU_CATEGORIES, MENU_ITEMS } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

/**
 * Section 5 — Featured Menu.
 *
 * "Popular" is a computed view over isPopular rather than a category on the
 * items themselves, so a dish can be both a Burger and popular without
 * being duplicated in the data.
 *
 * The favourite heart is local, optimistic state on purpose: this is the
 * public page and a visitor may not be signed in. Adding to the cart sends
 * them into the real ordering flow, which is where auth is enforced.
 */
export function MenuSection() {
  const [category, setCategory] = useState('Popular')
  const [favorites, setFavorites] = useState(() => new Set())

  const visible =
    category === 'Popular' ? MENU_ITEMS.filter((item) => item.isPopular) : MENU_ITEMS.filter((item) => item.category === category)

  function toggleFavorite(id) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Section id="menu">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Featured menu"
          title="Tonight's most ordered plates"
          lead="A short list from a longer menu — the dishes the kitchen sends out most."
        />

        {/* Category tabs */}
        <Reveal className="flex flex-wrap justify-center gap-2">
          {MENU_CATEGORIES.map((name) => {
            const active = name === category
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                aria-pressed={active}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-brand-700 text-white shadow-lg shadow-brand-900/20'
                    : 'border border-rule bg-card text-body-muted hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400'
                }`}
              >
                {name}
              </button>
            )
          })}
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* AnimatePresence + layout keeps the grid from snapping when the
              filter changes — cards fade and settle into their new slots. */}
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-rule bg-card shadow-lg shadow-brand-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-900/12"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Photo
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={
                      favorites.has(item.id)
                        ? `Remove ${item.name} from favourites`
                        : `Add ${item.name} to favourites`
                    }
                    aria-pressed={favorites.has(item.id)}
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-charcoal-muted'
                      }`}
                    />
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-charcoal/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                    {item.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base leading-snug font-semibold text-body">
                      {item.name}
                    </h3>
                    <span className="font-display text-lg font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
                      ${item.price}
                    </span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-body-muted">{item.description}</p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Rating value={item.rating} />
                    <Link
                      to={`${ROUTES.ORDERS}/new`}
                      aria-label={`Add ${item.name} to your order`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white transition-all hover:scale-110 hover:bg-brand-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <Reveal className="flex justify-center">
          <Button as={Link} to={`${ROUTES.ORDERS}/new`} variant="outline" size="lg" className="group">
            View the full menu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}
