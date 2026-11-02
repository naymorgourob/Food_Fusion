import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

/**
 * The one place the FoodFusion logo mark is defined — AuthLayout, the
 * landing Navbar, and the Footer all render this instead of copy-pasting
 * the same logo emblem + wordmark markup three times.
 */
export function BrandMark({ size = 'md', tone = 'default' }) {
  const isSmall = size === 'sm'
  // `tone="onDark"` is opt-in for the landing page's dark canvas. The
  // default is unchanged so every dashboard/auth usage keeps its old look.
  const isOnDark = tone === 'onDark'

  return (
    <Link to={ROUTES.HOME} className="group flex items-center gap-2">
      <img
        src="/brand/logo-mark.png"
        alt=""
        aria-hidden
        className={`${isSmall ? 'h-7 w-7' : 'h-8 w-8'} flex-none rounded-full object-cover shadow-md ring-1 ring-gold-300/50 transition-transform group-hover:scale-105`}
      />
      <span
        className={`font-semibold ${isOnDark ? 'text-cream' : 'text-ink'} ${
          isSmall ? 'text-sm' : 'text-h4'
        }`}
      >
        FoodFusion
      </span>
    </Link>
  )
}
