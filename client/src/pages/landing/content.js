/**
 * Every piece of landing-page copy and imagery, in one file.
 *
 * Why it's centralised: the sections below are presentational, so all of the
 * "what does this restaurant actually say" lives here. Swapping in the real
 * restaurant's photography and menu later means editing this file only —
 * no component changes.
 *
 * Images are Unsplash CDN URLs with explicit width/quality params so we
 * aren't shipping 4000px originals. Replace `src` with local files in
 * /public once real photography exists; nothing else has to change.
 */

const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

export const HERO_IMAGE = {
  src: unsplash('1504674900247-0877df9cc836', 1000),
  alt: 'Seared beef fillet with seasonal vegetables, plated for service',
}

export const AMBIENCE_IMAGE = {
  src: unsplash('1517248135467-4c7edcad34c4', 1000),
  alt: 'The FoodFusion dining room at dusk, set for evening service',
}

export const CHEF_IMAGE = {
  src: unsplash('1577219491135-ce391730fb2c', 600),
  alt: 'Head chef finishing a dish at the pass',
}

// Section 5 — Featured Menu. `category` drives the tab filter; "Popular" is
// a computed view (isPopular) rather than a category of its own.
export const MENU_CATEGORIES = ['Popular', 'Burger', 'Pizza', 'Drinks', 'Desserts']

export const MENU_ITEMS = [
  {
    id: 'truffle-burger',
    name: 'Black Truffle Burger',
    description: 'Dry-aged beef, aged cheddar, shaved truffle, brioche.',
    price: 24,
    rating: 4.9,
    category: 'Burger',
    isPopular: true,
    image: unsplash('1568901346375-23c9450c58cd', 600),
    alt: 'Black truffle burger with melted cheese on a brioche bun',
  },
  {
    id: 'margherita',
    name: 'Margherita di Bufala',
    description: 'San Marzano, buffalo mozzarella, basil, 48-hour dough.',
    price: 19,
    rating: 4.8,
    category: 'Pizza',
    isPopular: true,
    image: unsplash('1604382354936-07c5d9983bd3', 600),
    alt: 'Wood-fired margherita pizza with fresh basil',
  },
  {
    id: 'wagyu-sliders',
    name: 'Wagyu Sliders',
    description: 'Three sliders, caramelised onion, house pickle.',
    price: 26,
    rating: 4.7,
    category: 'Burger',
    isPopular: false,
    image: unsplash('1550547660-d9450f859349', 600),
    alt: 'Trio of wagyu beef sliders on a wooden board',
  },
  {
    id: 'tartufo-pizza',
    name: 'Tartufo Bianco',
    description: 'White truffle cream, fior di latte, wild mushroom.',
    price: 23,
    rating: 4.9,
    category: 'Pizza',
    isPopular: true,
    image: unsplash('1513104890138-7c749659a591', 600),
    alt: 'White truffle pizza topped with wild mushrooms',
  },
  {
    id: 'negroni',
    name: 'Barrel-Aged Negroni',
    description: 'Aged eight weeks in oak, orange oil, single cube.',
    price: 14,
    rating: 4.8,
    category: 'Drinks',
    isPopular: false,
    image: unsplash('1514362545857-3bc16c4c7d1b', 600),
    alt: 'Barrel-aged negroni cocktail with an orange twist',
  },
  {
    id: 'citrus-spritz',
    name: 'Sicilian Citrus Spritz',
    description: 'Blood orange, prosecco, soda, rosemary.',
    price: 12,
    rating: 4.6,
    category: 'Drinks',
    isPopular: false,
    image: unsplash('1536935338788-846bb9981813', 600),
    alt: 'Blood orange spritz served over ice with rosemary',
  },
  {
    id: 'chocolate-fondant',
    name: 'Valrhona Fondant',
    description: 'Molten chocolate, salted caramel, crème fraîche.',
    price: 13,
    rating: 4.9,
    category: 'Desserts',
    isPopular: true,
    image: unsplash('1606313564200-e75d5e30476c', 600),
    alt: 'Molten chocolate fondant with a spoonful of cream',
  },
  {
    id: 'lemon-tart',
    name: 'Amalfi Lemon Tart',
    description: 'Torched meringue, candied zest, shortcrust.',
    price: 11,
    rating: 4.7,
    category: 'Desserts',
    isPopular: false,
    image: unsplash('1519915028121-7d3463d20b13', 600),
    alt: 'Lemon tart with torched meringue peaks',
  },
]

// Section 10 — testimonials. Portraits are Unsplash faces; names are
// illustrative, as the demo data throughout this project is.
export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Priya Nair',
    role: 'Regular guest',
    rating: 5,
    quote:
      'The tasting menu was the best meal I have had all year. Booking a table took about ten seconds, and the kitchen remembered my allergy without being asked twice.',
    avatar: unsplash('1494790108377-be9c29b29330', 160),
  },
  {
    id: 't2',
    name: 'James Carter',
    role: 'Ordered delivery',
    rating: 5,
    quote:
      'Ordered on a Friday night expecting the usual wait. Live tracking said 28 minutes and it arrived in 26, still properly hot. The truffle burger is worth every penny.',
    avatar: unsplash('1500648767791-00dcc994a43e', 160),
  },
  {
    id: 't3',
    name: 'Aisha Khan',
    role: 'Celebrated an anniversary',
    rating: 5,
    quote:
      'I noted it was our anniversary when booking and they had the table dressed for it when we arrived. Small thing, but it is exactly why we keep coming back.',
    avatar: unsplash('1438761681033-6461ffad8d80', 160),
  },
]

// Section 11 — gallery. Varying spans is what makes the grid read as a
// composed masonry wall rather than a uniform sheet of thumbnails.
export const GALLERY = [
  { src: unsplash('1517248135467-4c7edcad34c4', 800), alt: 'Dining room at dusk', span: 'lg:col-span-2 lg:row-span-2' },
  { src: unsplash('1414235077428-338989a2e8c0', 600), alt: 'Guests dining at the bar', span: '' },
  { src: unsplash('1466978913421-dad2ebd01d17', 600), alt: 'Pastry chef finishing a dessert', span: '' },
  { src: unsplash('1600891964092-4316c288032e', 600), alt: 'Plated main course', span: '' },
  { src: unsplash('1552566626-52f8b828add9', 600), alt: 'Table set for evening service', span: '' },
  { src: unsplash('1556910103-1c02745aae4d', 800), alt: 'The open kitchen at service', span: 'lg:col-span-2' },
]

// Section 14 — footer.
export const OPENING_HOURS = [
  { days: 'Monday — Thursday', hours: '12:00 — 22:30' },
  { days: 'Friday — Saturday', hours: '12:00 — 23:30' },
  { days: 'Sunday', hours: '12:00 — 21:00' },
]

export const CONTACT = {
  address: '14 Gulshan Avenue, Dhaka 1212',
  phone: '+880 1700 000 000',
  email: 'hello@foodfusion.app',
  // A plain embed URL — no API key required, and no external script.
  mapSrc:
    'https://www.google.com/maps?q=Gulshan%20Avenue%2C%20Dhaka&output=embed',
}
