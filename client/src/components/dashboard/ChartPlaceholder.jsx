import { BarChart3 } from 'lucide-react'

// No chart library installed yet, per this part's scope — an honest empty
// state rather than a fake static image pretending to be a real chart.
// Swapping in a real chart later (see the dataviz skill when that day
// comes) means replacing this component's insides, not its call sites.
export function ChartPlaceholder({ title }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-paper">
        <BarChart3 className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
        <span className="text-xs text-ink-faint">Chart coming soon</span>
      </div>
    </div>
  )
}
