// Background-free cutouts of dishes, in public/plated/<slug>.webp, so the
// food itself sits on the drawn plate instead of a photo of another plate.
// Generated from the seeded menu photos; dishes not listed here (and any
// admin upload) fall back to their photo, feathered into the plate.
const PLATED = new Set([
  'apple-salad',
  'artisan-truffle-burger',
  'bbq-chicken-meal',
  'truffle-bruschetta',
  'blueberry-cheesecake',
  'butter-chicken-delicacy',
  'cashew-nut-chicken-salad',
  'chicken-reshmi-kebab',
  'creamy-alfredo',
  'crispy-chicken-burger',
  'crispy-chicken-tortilla-wrap',
  'dhakai-crispy-prawn-tempura',
  'fragrant-kalijira-polao',
  'garlic-butter-naan',
  'grilled-dahi-fish-tikka',
  'grilled-dory-meal',
  'grilled-ribeye-steak',
  'ilish-bhapa',
  'mango-sticky-rice',
  'naga-wings',
  'pad-thai',
  'pan-seared-atlantic-salmon',
  'peri-peri-chicken-meal',
  'pesto-chicken-sandwich',
  'roasted-potato-salad',
  'rustic-carbonara',
  'seafood-chowder',
  'seafood-clear-soup',
  'shazy',
  'sirloin-steak-sandwich',
  'spiced-lamb-chops-platter',
  'spicy-seafood-spaghetti',
  'thai-chicken-basil',
  'thai-fried-rice',
  'tom-yum-goong',
  'wild-mushroom-fettuccine',
])

export function slugify(name) {
  return String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getPlatedImage(dish) {
  const slug = slugify(dish?.name)
  return PLATED.has(slug) ? `/plated/${slug}.webp` : null
}
