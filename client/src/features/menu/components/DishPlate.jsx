import { useState } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { getMenuImageUrl } from '@/constants'
import { getPlatedImage } from '@/features/menu/utils/platedImages'

/**
 * A dish served on a plate seen at a three-quarter angle, like a plate on a
 * table photographed from a seat. The menu photos are mostly side-on, so
 * the plate is tipped back into an oval and the food lies in its well:
 * a background-free cutout when there is one (so there's no second plate
 * or table in the picture), otherwise the photo's centre feathered in.
 * Plate and food turn together (slowly on its own, plus any `rotate`).
 *
 * tone="dark": a matte charcoal coupe plate — wide shallow rim in soft
 * light and a gently shaded centre the food sits in.
 * tone="light": a slimmer slate plate with a warm shadow for the blush panel.
 * tone="ceramic": a cream speckled stoneware plate with a thin brown rim,
 * for the glass menu cards.
 * tone="terracotta": a glazed clay plate with a hand-painted cream leaf
 * chain around the rim, for Bangladeshi dishes.
 */
const CERAMIC_PLATE = {
  body: {
    backgroundColor: '#EFE9E1',
    backgroundImage: [
      'radial-gradient(rgba(110, 80, 55, 0.22) 0.7px, transparent 1px)',
      'radial-gradient(rgba(110, 80, 55, 0.14) 0.6px, transparent 0.9px)',
      'radial-gradient(circle at 35% 28%, #FDFBF7 0%, #EFE9E1 55%, #DED4C7 100%)',
    ].join(', '),
    backgroundSize: '11px 11px, 17px 17px, 100% 100%',
    backgroundPosition: '0 0, 5px 8px, 0 0',
    boxShadow:
      '0 28px 34px -18px rgba(40, 25, 15, 0.6), inset 0 0 0 2px #8B6A4F, inset 0 0 0 4px rgba(255, 255, 255, 0.55)',
  },
  well: {
    boxShadow: 'inset 0 5px 12px rgba(80, 60, 40, 0.28), 0 1px 0 rgba(255, 255, 255, 0.8)',
  },
}

// Cream slip-painted leaf chain: pairs of teardrop strokes angled along
// the rim, repeated around the plate like the reference's brushwork.
const LEAF_COUNT = 40
function LeafRing() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
      <g fill="#F4E4C8">
        {Array.from({ length: LEAF_COUNT }).map((_, index) => (
          <g key={index} transform={`rotate(${(index * 360) / LEAF_COUNT} 50 50)`}>
            <path d="M49.4 2.6 C 51.4 3.1, 53.6 4.5, 55 6.5 C 53.3 6.2, 51 5.1, 49.2 3.9 Z" />
            <path d="M49.4 11 C 51.4 10.5, 53.6 9.1, 55 7.1 C 53.3 7.4, 51 8.5, 49.2 9.7 Z" />
            <circle cx="55.2" cy="6.8" r="0.7" />
          </g>
        ))}
      </g>
    </svg>
  )
}

const TERRACOTTA_PLATE = {
  body: {
    background:
      'radial-gradient(circle at 38% 30%, #D8742F 0%, #C45F22 45%, #A84B18 85%, #8E3E13 100%)',
    boxShadow:
      '0 28px 34px -18px rgba(70, 30, 10, 0.65), inset 0 2px 2px rgba(255, 220, 190, 0.35), inset 0 -3px 6px rgba(80, 30, 5, 0.5)',
  },
  well: {
    background: 'radial-gradient(circle at 40% 35%, #CF6A28, #B5541C 80%)',
    boxShadow: 'inset 0 5px 12px rgba(80, 30, 5, 0.45), 0 1px 0 rgba(255, 210, 170, 0.35)',
  },
  // Glossy glaze: a bright streak on the rim, like the window reflection.
  gloss: {
    background:
      'conic-gradient(from 230deg, transparent 0deg, rgba(255,245,230,0.55) 14deg, transparent 30deg, transparent 180deg, rgba(255,245,230,0.25) 196deg, transparent 214deg)',
    maskImage: 'radial-gradient(circle, transparent 72%, #000 75%, #000 97%, transparent 99%)',
    WebkitMaskImage:
      'radial-gradient(circle, transparent 72%, #000 75%, #000 97%, transparent 99%)',
  },
}

const FEATHER = {
  maskImage: 'radial-gradient(circle, #000 52%, transparent 71%)',
  WebkitMaskImage: 'radial-gradient(circle, #000 52%, transparent 71%)',
}

const LIGHT_TONE =
  'from-[#44536A] via-[#1F2A38] to-[#121A24] shadow-[0_34px_46px_-16px_rgba(80,40,20,0.55)]'

// Masks that confine an effect to the rim (outside the well).
const RIM_MASK = 'radial-gradient(circle, transparent 63%, #000 67%, #000 97%, transparent 99%)'

// Matte charcoal coupe plate, after the reference: a wide shallow rim that
// rises gently toward the edge and catches soft light from the upper left,
// a softly shaded centre (no hard well ring), and a thin catch-light lip.
const BLACK_PLATE = {
  body: {
    background: [
      // Shallow bowl: centre a touch darker, rim lifting into the light.
      'radial-gradient(circle, #1a1a1b 0%, #1d1d1e 48%, #262628 70%, #2e2e30 86%, #222224 95%, #161617 100%)',
    ].join(', '),
    boxShadow:
      '0 30px 40px -18px rgba(0,0,0,0.75), 0 8px 14px -8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.14)',
  },
  // Soft directional light across the rim (upper left bright, lower right dim).
  light: {
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 38%, transparent 55%, rgba(0,0,0,0.25) 100%)',
  },
  // Thin lighter lip at the very edge.
  lip: {
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 2px 3px rgba(255,255,255,0.08)',
  },
  // Gentle dip where the rim meets the centre: a soft shadow on the far
  // side and a faint highlight on the near side, nothing hard-edged.
  well: {
    background:
      'radial-gradient(circle at 50% 44%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 55%, transparent 72%)',
    boxShadow:
      'inset 0 6px 10px -6px rgba(0,0,0,0.55), inset 0 -3px 6px -4px rgba(255,255,255,0.06)',
  },
  // A broad, low sheen on the lit side of the rim.
  sheen: {
    background:
      'conic-gradient(from 250deg, transparent 0deg, rgba(255,255,255,0.09) 40deg, transparent 95deg)',
    maskImage: RIM_MASK,
    WebkitMaskImage: RIM_MASK,
  },
}

// Per-tone plate: the surface (rotates), what sits in it under the food,
// and fixed highlights on top.
const TONES = {
  dark: {
    body: { style: BLACK_PLATE.body },
    under: (
      <>
        <span className="absolute inset-0 rounded-full" style={BLACK_PLATE.light} />
        <span className="absolute inset-[0.5%] rounded-full" style={BLACK_PLATE.lip} />
        <span className="absolute inset-[16%] rounded-full" style={BLACK_PLATE.well} />
      </>
    ),
    foodInset: 'inset-[22%]',
    over: <span className="absolute inset-0 rounded-full" style={BLACK_PLATE.sheen} />,
  },
  light: {
    body: { className: `bg-gradient-to-br ring-1 ring-white/10 ${LIGHT_TONE}` },
    under: null,
    foodInset: 'inset-[6%]',
    over: (
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.16),transparent_42%)]" />
    ),
  },
  ceramic: {
    body: { style: CERAMIC_PLATE.body },
    under: <span className="absolute inset-[9%] rounded-full" style={CERAMIC_PLATE.well} />,
    foodInset: 'inset-[12.5%]',
    over: (
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_40%)]" />
    ),
  },
  terracotta: {
    body: { style: TERRACOTTA_PLATE.body },
    under: (
      <>
        <LeafRing />
        <span className="absolute inset-[13%] rounded-full" style={TERRACOTTA_PLATE.well} />
      </>
    ),
    foodInset: 'inset-[20%]',
    over: <span className="absolute inset-0 rounded-full" style={TERRACOTTA_PLATE.gloss} />,
  },
}

// How far the plate is tipped back from facing the viewer: enough to read
// as a plate on a table, shallow enough that the food on it stays clear.
const PLATE_TILT = 'rotateX(40deg)'

export function DishPlate({
  dish,
  rotate,
  spin = true,
  dimmed = false,
  tone = 'dark',
  className = '',
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [cutoutFailed, setCutoutFailed] = useState(false)
  const { primary, fallback } = getMenuImageUrl(dish)
  const image = imageFailed ? fallback : primary || fallback
  const plated = getPlatedImage(dish)
  const cutout = plated && !cutoutFailed
  const plate = TONES[tone] ?? TONES.dark
  const gray = dimmed ? 'grayscale' : ''

  return (
    <div className={`relative aspect-[5/4] w-full ${className}`} style={{ perspective: '1100px' }}>
      {/* The plate, tipped back into an oval; the food lies on it and
          turns with it, like a dish on a lazy susan. */}
      <div
        className="absolute inset-x-0 top-[-10%] aspect-square"
        style={{ transform: PLATE_TILT }}
      >
        <motion.div style={{ rotate }} className="absolute inset-0">
          <div className={`absolute inset-0 ${spin ? 'animate-plate-spin' : ''}`}>
            <div
              className={`absolute inset-0 rounded-full ${plate.body.className ?? ''}`}
              style={plate.body.style}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {plate.under}
            </div>

            {!cutout && (
              // No cutout: the photo's centre, feathered into the plate.
              <div className={`absolute ${plate.foodInset} overflow-hidden rounded-full`}>
                {image ? (
                  <img
                    src={image}
                    alt={dish.name}
                    draggable={false}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    style={FEATHER}
                    className={`h-full w-full scale-125 object-cover select-none ${gray}`}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <UtensilsCrossed className="h-1/4 w-1/4 text-black/20" strokeWidth={1.25} />
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {plate.over}
        </div>
      </div>

      {/* A plated portion: the food stands in the middle of the plate at
          about half its width, leaving a wide ring of plate around it. */}
      {cutout && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute top-[64%] left-[27%] h-[12%] w-[46%] rounded-[50%] bg-black/55 blur-md"
          />
          <div className="pointer-events-none absolute inset-x-[21%] top-[20%] bottom-[28%] flex items-end justify-center">
            <img
              src={plated}
              alt={dish.name}
              draggable={false}
              loading="lazy"
              onError={() => setCutoutFailed(true)}
              className={`max-h-full max-w-full object-contain drop-shadow-[0_6px_5px_rgba(0,0,0,0.5)] select-none ${gray}`}
            />
          </div>
        </>
      )}
    </div>
  )
}
