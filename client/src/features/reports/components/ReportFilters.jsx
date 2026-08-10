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
  return [current, current - 1, current - 2]
}

const YEAR_OPTIONS = recentYears()

const SELECT_CLASSES =
  'rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100'

/**
 * One filter, three shapes — which fields are shown depends on `mode`,
 * matching resolveDateRange on the backend exactly: 'date' sends just a
 * date, 'month' sends year+month, 'year' sends year alone. Every report
 * on the page (stats aside) reads the same filter, so this lives once at
 * the top of ReportsPage rather than once per chart.
 */
export function ReportFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-filter-mode" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Filter By
        </label>
        <select
          id="report-filter-mode"
          value={filters.mode}
          onChange={(event) => onChange({ mode: event.target.value })}
          className={SELECT_CLASSES}
        >
          <option value="year">Year</option>
          <option value="month">Month</option>
          <option value="date">Date</option>
        </select>
      </div>

      {(filters.mode === 'year' || filters.mode === 'month') && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-filter-year" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Year
          </label>
          <select
            id="report-filter-year"
            value={filters.year}
            onChange={(event) => onChange({ year: Number(event.target.value) })}
            className={SELECT_CLASSES}
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-filter-month" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Month
          </label>
          <select
            id="report-filter-month"
            value={filters.month}
            onChange={(event) => onChange({ month: Number(event.target.value) })}
            className={SELECT_CLASSES}
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-filter-date" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Date
          </label>
          <input
            id="report-filter-date"
            type="date"
            value={filters.date}
            onChange={(event) => onChange({ date: event.target.value })}
            className={SELECT_CLASSES}
          />
        </div>
      )}
    </div>
  )
}
