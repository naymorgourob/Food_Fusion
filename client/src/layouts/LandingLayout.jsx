import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

/**
 * Chrome for public marketing pages (Home, and later About/Pricing/etc).
 * Navbar and Footer live here, exactly as planned back in Part 5 — every
 * public page gets them for free just by rendering under this layout.
 */
export default function LandingLayout() {
  // bg-canvas (not bg-paper): the public site has its own emerald/gold
  // palette, defined alongside the app tokens in styles/index.css. The
  // app-wide semantic tokens are untouched, so the dashboard, auth pages,
  // and customer portal are unaffected.
  //
  // No top padding for the navbar: it's fixed and deliberately overlays the
  // hero photograph, which is what lets the image run to the top of the
  // viewport. Every later section is pushed clear by the hero's own height.
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
