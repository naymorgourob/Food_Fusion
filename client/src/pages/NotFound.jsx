import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="font-mono text-sm text-ink-faint">404</span>
      <h1 className="text-h2 font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
      >
        Back to home
      </Link>
    </div>
  )
}
