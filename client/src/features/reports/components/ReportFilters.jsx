import { Calendar, CalendarDays, RotateCcw, SlidersHorizontal } from 'lucide-react'

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function recentYears() {
  const current = new Date().getFullYear()
  return [current, current - 1, current - 2, current - 3]
}

const YEAR_OPTIONS = recentYears()

export function ReportFilters({ filters, onChange, onReset }) {
  const isCustomPeriod =
    filters.mode !== 'year' || filters.year !== new Date().getFullYear()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Mode selection tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-rule bg-canvas p-1">
        <button
          type="button"
          onClick={() => onChange({ mode: 'year' })}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            filters.mode === 'year'
              ? 'bg-card text-body shadow-sm ring-1 ring-rule'
              : 'text-body-muted hover:text-body'
          }`}
        >
          Yearly
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'month' })}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            filters.mode === 'month'
              ? 'bg-card text-body shadow-sm ring-1 ring-rule'
              : 'text-body-muted hover:text-body'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'date' })}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            filters.mode === 'date'
              ? 'bg-card text-body shadow-sm ring-1 ring-rule'
              : 'text-body-muted hover:text-body'
          }`}
        >
          Daily Date
        </button>
      </div>

      {/* Selectors depending on active mode */}
      <div className="flex flex-wrap items-center gap-2.5">
        {(filters.mode === 'year' || filters.mode === 'month') && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-body-muted hidden sm:inline">Year:</span>
            <select
              value={filters.year}
              onChange={(e) => onChange({ year: Number(e.target.value) })}
              aria-label="Filter by year"
              className="rounded-xl border border-rule bg-canvas px-3 py-1.5 text-xs font-semibold text-body focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {filters.mode === 'month' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-body-muted hidden sm:inline">Month:</span>
            <select
              value={filters.month}
              onChange={(e) => onChange({ month: Number(e.target.value) })}
              aria-label="Filter by month"
              className="rounded-xl border border-rule bg-canvas px-3 py-1.5 text-xs font-semibold text-body focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filters.mode === 'date' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-body-muted hidden sm:inline">Date:</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => onChange({ date: e.target.value })}
              aria-label="Filter by exact date"
              className="rounded-xl border border-rule bg-canvas px-3 py-1.5 text-xs font-semibold text-body focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
            />
          </div>
        )}

        {/* Reset button */}
        {isCustomPeriod && onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset to current year"
            className="inline-flex items-center gap-1 rounded-xl border border-rule bg-canvas px-2.5 py-1.5 text-xs font-medium text-body-muted transition-colors hover:bg-canvas-2 hover:text-body"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}
