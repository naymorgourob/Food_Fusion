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

export const STOREFRONT_IMAGE = {
  src: '/ambience/cafe-front.jpg',
  alt: 'The FoodFusion storefront: ivy-covered brick, lantern-lit windows and bistro tables on the terrace',
}

export const EVENING_ROOM_IMAGE = {
  src: '/ambience/evening-room.jpg',
  alt: 'The FoodFusion dining room at night: navy panelling, copper lamps and candle-lit tables',
}

export const AMBIENCE_IMAGE = {
  src: '/ambience/dining-room.jpg',
  alt: 'The FoodFusion dining room: arched tiled windows, hanging lanterns and velvet banquettes',
}

export const CHEF_IMAGE = {
  src: unsplash('1577219491135-ce391730fb2c', 600),
  alt: 'Head chef finishing a dish at the pass',
}

// Section 10 — testimonials. Portraits are Unsplash faces; names are
// illustrative, as the demo data throughout this project is.
export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Durjoy',
    role: 'Regular guest',
    rating: 5,
    quote:
      'The tasting menu was the best meal I have had all year. Booking a table took about ten seconds, and the kitchen remembered my allergy without being asked twice.',
  },
  {
    id: 't2',
    name: 'Gourab',
    role: 'Ordered delivery',
    rating: 5,
    quote:
      'Ordered on a Friday night expecting the usual wait. Live tracking said 28 minutes and it arrived in 26, still properly hot. The naga wings are worth every taka.',
  },
  {
    id: 't3',
    name: 'Habib',
    role: 'Celebrated an anniversary',
    rating: 5,
    quote:
      'I noted it was our anniversary when booking and they had the table dressed for it when we arrived. Small thing, but it is exactly why we keep coming back.',
  },
]

// Section 11 — gallery. Varying spans is what makes the grid read as a
// composed masonry wall rather than a uniform sheet of thumbnails.
// The restaurant's own photos: dining rooms, table spots and dishes.
// Spans fill a 4-column grid exactly (a 2x2 feature, four singles, then a
// wide tile and two singles), so there's no empty cell at the end.
export const GALLERY = [
  {
    src: '/ambience/evening-room.jpg',
    alt: 'The dining room at night, lit by copper lamps',
    span: 'lg:col-span-2 lg:row-span-2',
    // Frame the lit room, not the empty wall on the photo's left.
    position: 'object-right',
  },
  { src: '/tables/calm-corner.jpg', alt: 'A calm corner table among the plants', span: '' },
  { src: '/dishes/bhorta-platter.jpg', alt: 'Bhorta platter on a brass thali', span: '' },
  { src: '/tables/garden-library.jpg', alt: 'Garden booth under the hanging plants', span: '' },
  { src: '/dishes/kacchi-biryani.jpg', alt: 'Dhaka kacchi biryani', span: '' },
  { src: '/ambience/cafe-front.jpg', alt: 'The terrace out front', span: 'lg:col-span-2' },
  { src: '/dishes/dab-chingri.jpg', alt: 'Dab chingri served in a green coconut', span: '' },
  { src: '/tables/window-lounge.jpg', alt: 'Window lounge by the brick wall', span: '' },
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
  mapSrc: 'https://www.google.com/maps?q=Gulshan%20Avenue%2C%20Dhaka&output=embed',
}
