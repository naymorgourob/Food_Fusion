import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { getMenuImageUrl } from '@/constants'

/**
 * A dish photo shown whole, never cropped: the full picture sits on top
 * (object-contain) and a blurred copy of the same photo fills the frame
 * behind it, so photos of any shape fit any frame without empty bars.
 * Fills its parent, which sets the frame's size, shape and rounding.
 */
export function FullPhoto({ dish, dimmed = false, zoomOnHover = false, className = '' }) {
  const [failed, setFailed] = useState(false)
  const { primary, fallback } = getMenuImageUrl(dish)
  const src = failed ? fallback : primary || fallback
  const gray = dimmed ? 'grayscale' : ''

  if (!src) {
    return (
      <span className={`flex h-full w-full items-center justify-center bg-canvas-2 ${className}`}>
        <UtensilsCrossed className="h-1/4 w-1/4 text-body-faint" strokeWidth={1.25} />
      </span>
    )
  }

  return (
    <span className={`relative block h-full w-full overflow-hidden ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className={`absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-xl ${gray}`}
      />
      <img
        src={src}
        alt={dish?.name ?? ''}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className={`relative h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] ${
          zoomOnHover ? 'transition-transform duration-700 group-hover:scale-[1.03]' : ''
        } ${gray}`}
      />
    </span>
  )
}
