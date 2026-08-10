import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Search, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, USER_ROLES, getHomeRouteForRole } from '@/constants'

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Menu', href: '#menu' },
  { label: 'Reservations', href: '#reserve' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

/**
 * Section 1. Transparent while the hero photograph is behind it, then
 * frosted once scrolled — the standard premium-restaurant pattern, and the
 * reason the hero image is allowed to run to the very top of the viewport.
 *
 * Because it sits over a dark hero at rest, every control has a light-on-dark
 * treatment until `scrolled` flips it to the normal token colours.
 */
export function Navbar() {
  const { user, isLoading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Once the mobile sheet is open it has its own solid background, so the
  // bar must use the solid treatment too regardless of scroll position.
  const solid = scrolled || mobileOpen

  const linkClasses = solid
    ? 'text-body-muted hover:text-brand-700 dark:hover:text-brand-400'
    : 'text-white/85 hover:text-white'
  const iconClasses = solid
    ? 'text-body-muted hover:bg-canvas-2 hover:text-body'
    : 'text-white/85 hover:bg-white/10 hover:text-white'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'border-b border-rule bg-canvas/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link to={ROUTES.HOME} className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-semibold text-white ring-1 ring-gold-500/40 transition-transform group-hover:scale-105">
            F
          </span>
          <span className="flex flex-col leading-none">
            <span className={`font-display text-lg font-semibold ${solid ? 'text-body' : 'text-white'}`}>
              FoodFusion
            </span>
            <span
              className={`text-[0.6rem] tracking-[0.2em] uppercase ${solid ? 'text-gold-700 dark:text-gold-300' : 'text-gold-300'}`}
            >
              Fine Dining
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${linkClasses}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {/* Search and cart point at real destinations rather than being
              decorative: search scrolls to the menu, cart opens the
              customer's order flow (which already exists). */}
          <a
            href="#menu"
            aria-label="Search the menu"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${iconClasses}`}
          >
            <Search className="h-4 w-4" />
          </a>
          <Link
            to={user?.role === USER_ROLES.CUSTOMER ? `${ROUTES.ORDERS}/new` : ROUTES.LOGIN}
            aria-label="Your order"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${iconClasses}`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-canvas" />
          </Link>

          <span className={`mx-1 h-5 w-px ${solid ? 'bg-rule' : 'bg-white/25'}`} />

          {!isLoading && <AuthActions user={user} logout={logout} solid={solid} />}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className={`lg:hidden ${solid ? 'text-body' : 'text-white'}`}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-rule bg-canvas px-5 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-body-muted hover:bg-canvas-2 hover:text-body"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-rule pt-4">
            {!isLoading && <AuthActions user={user} logout={logout} solid stacked />}
          </div>
        </div>
      )}
    </header>
  )
}

function AuthActions({ user, logout, solid, stacked }) {
  const layout = stacked ? 'flex flex-col gap-2' : 'flex items-center gap-2'
  const quiet = solid
    ? 'text-body-muted hover:text-body'
    : 'text-white/85 hover:text-white'
  const solidButton =
    'rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800'

  if (user) {
    const isAdmin = user.role === USER_ROLES.ADMIN
    return (
      <div className={layout}>
        <Link to={getHomeRouteForRole(user.role)} className={`px-3 text-sm font-medium ${quiet}`}>
          Dashboard
        </Link>
        {/* Admin has a dedicated dashboard profile page; Staff/Customer use
            their account page instead. */}
        <Link
          to={isAdmin ? '/dashboard/profile' : ROUTES.ACCOUNT}
          className={`px-3 text-sm font-medium ${quiet}`}
        >
          Profile
        </Link>
        <button onClick={logout} className={solidButton}>
          Log out
        </button>
      </div>
    )
  }

  return (
    <div className={layout}>
      <Link to={ROUTES.LOGIN} className={`px-3 text-sm font-medium ${quiet}`}>
        Login
      </Link>
      <Link to={ROUTES.REGISTER} className={solidButton}>
        Register
      </Link>
    </div>
  )
}
