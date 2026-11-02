import { DrinkCard } from '@/features/menu/components/DrinkCard'

/**
 * A single dish in the menu grid (UI-03). Food and drinks share the
 * coffee-house card (DrinkCard): the photo in a tile standing up out of a
 * brown glass card, centred name and description, price and a teal add
 * button. The drawn plates are used only by the hero carousel.
 *
 * Every field shown is a real column on the Food model; ratings, review
 * counts and calories don't exist in the schema, so they're omitted
 * rather than faked. Unavailable dishes stay visible but can't be added,
 * matching the backend.
 */
export function MenuDishCard(props) {
  return <DrinkCard {...props} />
}
