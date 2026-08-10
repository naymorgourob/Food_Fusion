import { Outlet } from 'react-router-dom'

/**
 * Chrome for 404 / 401 and any other standalone error page — deliberately
 * has no navigation at all, since the point is to get the user back to a
 * known-good page, not to present a broken app shell around the error.
 */
export default function ErrorLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Outlet />
    </div>
  )
}
