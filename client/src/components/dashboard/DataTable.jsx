/**
 * Presentational only — it renders whatever rows/columns it's given and
 * knows nothing about search, filtering, sorting, or pagination (those
 * live in the page component, since they're tied to API query params, not
 * to how a table is drawn). Reused by every list in every future module.
 *
 * `minWidth` defaults to 640px (every existing full-width list page relies
 * on this). Reports (Part 16) is the first place DataTable sits inside a
 * multi-column grid — a 2-3 column summary table there doesn't need 640px
 * and would otherwise clip inside its narrow card, so that usage passes a
 * smaller value.
 */
export function DataTable({ columns, rows, getRowKey, isLoading, emptyMessage = 'No data yet.', minWidth = 640 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm" style={{ minWidth: `${minWidth}px` }}>
        <thead className="sticky top-0 bg-surface-2">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-faint"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-muted">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-surface-2">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle text-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
