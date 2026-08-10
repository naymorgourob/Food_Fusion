import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

/**
 * The one place the FoodFusion logo mark is defined — AuthLayout, the
 * landing Navbar, and the Footer all render this instead of copy-pasting
 * the same "F" badge + wordmark markup three times.
 */
export function BrandMark({ size = 'md', tone = 'default' }) {
  const isSmall = size === 'sm'
  // `tone="onDark"` is opt-in for the landing page's dark canvas. The
  // default is unchanged so every dashboard/auth usage keeps its old look.
  const isOnDark = tone === 'onDark'

  return (
    <Link to={ROUTES.HOME} className="group flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-lg font-bold transition-transform group-hover:scale-105 ${
          isOnDark
            ? 'bg-gradient-to-br from-saffron-300 to-chili-500 text-night-900'
            : 'bg-ember-600 text-white'
        } ${isSmall ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'}`}
      >
        F
      </span>
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
