/**
 * Temporary stand-in rendered by every route until its real page is built in
 * a later phase. Having one shared component means swapping it out for the
 * real UI later touches one file at a time, not a copy-pasted block per page.
 */
export default function RoutePlaceholder({ title, note }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-h1 font-semibold text-ink">{title}</h1>
      {note && <p className="max-w-md text-sm text-ink-muted">{note}</p>}
    </div>
  )
}
