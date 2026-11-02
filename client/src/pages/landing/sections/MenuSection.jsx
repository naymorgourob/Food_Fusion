import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Plus, ArrowRight, Clock } from 'lucide-react'
import {
  Container,
  Section,
  SectionHeading,
  Reveal,
  Button,
} from '@/components/landing/primitives'
import { useCategories } from '@/features/menu/hooks/useCategories'
import { useMenuItems } from '@/features/menu/hooks/useMenuItems'
import { FullPhoto } from '@/features/menu/components/FullPhoto'
import { ROUTES } from '@/constants'
import { money } from '@/utils/format'

const SHOWN = 4

// Tabs over the real menu. "Chef's picks" is the isChefPick flag; the rest
// are real categories, matched by name so a renamed or removed category
// simply drops its tab instead of breaking the section.
const TABS = [
  { label: "Chef's picks", tag: 'chef' },
  { label: 'Bangladeshi', match: /bangla/i },
  { label: 'Mains', match: /main course/i },
  { label: 'Coffee', match: /^coffee$/i },
  { label: 'Desserts', match: /dessert/i },
]

/**
 * Section 5 — Featured Menu.
 *
 * Shows real dishes from the menu API (which is public), so everything a
 * visitor sees here can actually be ordered. No ratings are shown: the menu
 * doesn't store any, and made-up stars would mislead.
 *
 * The favourite heart is local, optimistic state on purpose: this is the
 * public page and a visitor may not be signed in. Adding to the cart sends
 * them into the real ordering flow, which is where auth is enforced.
 */
export function MenuSection() {
  const [tabLabel, setTabLabel] = useState(TABS[0].label)
  const [favorites, setFavorites] = useState(() => new Set())
  const { categories } = useCategories()

  const tabs = TABS.map((tab) => ({
    ...tab,
    categoryId: tab.match
      ? categories.find((category) => tab.match.test(category.name))?.id
      : undefined,
  })).filter((tab) => tab.tag || tab.categoryId)
  const tab = tabs.find((candidate) => candidate.label === tabLabel) ?? tabs[0]

  const { items, isLoading } = useMenuItems({
    isAvailable: 'true',
    tag: tab?.tag,
    categoryId: tab?.categoryId,
    sortBy: 'newest',
    page: 1,
    pageSize: SHOWN,
  })

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
          {tabs.map(({ label: name }) => {
            const active = name === tab?.label
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTabLabel(name)}
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
            {isLoading &&
              items.length === 0 &&
              Array.from({ length: SHOWN }).map((_, index) => (
                <div key={`skeleton-${index}`} className="skeleton h-96 rounded-3xl" aria-hidden />
              ))}
            {items.map((item) => (
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
                  <FullPhoto dish={item} zoomOnHover />
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
                    {item.category?.name}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base leading-snug font-semibold text-body">
                      {item.name}
                    </h3>
                    <span className="font-display text-lg font-semibold whitespace-nowrap text-brand-700 dark:text-brand-400">
                      {money(item.price)}
                    </span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-body-muted">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {item.prepTimeMinutes ? (
                      <span className="flex items-center gap-1.5 text-sm text-body-faint">
                        <Clock className="h-4 w-4" />
                        Ready in ~{item.prepTimeMinutes} min
                      </span>
                    ) : (
                      <span />
                    )}
                    <Link
                      to={`${ROUTES.ORDERS}/new?q=${encodeURIComponent(item.name)}`}
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
          <Button
            as={Link}
            to={`${ROUTES.ORDERS}/new`}
            variant="outline"
            size="lg"
            className="group"
          >
            View the full menu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}
