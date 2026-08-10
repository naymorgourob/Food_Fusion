import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="font-mono text-sm text-ink-faint">401</span>
      <h1 className="text-h2 font-semibold text-ink">You do not have access</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Your account role does not have permission to view this page.
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
