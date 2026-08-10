// Same card chrome as ChartPlaceholder.jsx (Part 8) — this is what that
// placeholder gets swapped out for, on this page only, now that there's
// real data and a real chart to put inside it.
export function ChartCard({ title, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  )
}
