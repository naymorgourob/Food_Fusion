// Single source of truth for "what does filtering by date/month/year mean" —
// used by every period-filtered report (orders, revenue, reservations) so
// the three never disagree on how a filter maps to a date range.
//
//   date given            -> that single day,       broken down by day
//   month + year given    -> that month,             broken down by day
//   year given alone      -> that year,               broken down by month
//   nothing given         -> the current year,        broken down by month
export function resolveDateRange({ date, month, year }) {
  const now = new Date()

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    return { start, end, granularity: 'day' }
  }

  const y = year ? Number(year) : now.getUTCFullYear()

  if (month) {
    const m = Number(month) - 1
    const start = new Date(Date.UTC(y, m, 1))
    const end = new Date(Date.UTC(y, m + 1, 1))
    return { start, end, granularity: 'day' }
  }

  const start = new Date(Date.UTC(y, 0, 1))
  const end = new Date(Date.UTC(y + 1, 0, 1))
  return { start, end, granularity: 'month' }
}

// label: 'YYYY-MM-DD' for a day bucket, 'YYYY-MM' for a month bucket.
function labelFor(date, granularity) {
  const iso = date.toISOString()
  return granularity === 'day' ? iso.slice(0, 10) : iso.slice(0, 7)
}

// Groups already-fetched rows into buckets by day/month — done in JS
// rather than a raw SQL date_trunc, since report data volumes here are
// small (university project scope) and this keeps every report's grouping
// logic in one plain, readable place instead of a Prisma $queryRaw.
export function buildTimeSeries(rows, granularity, { dateField, amountField }) {
  const buckets = new Map()

  for (const row of rows) {
    const label = labelFor(row[dateField], granularity)
    const bucket = buckets.get(label) ?? { label, count: 0, amount: 0 }
    bucket.count += 1
    if (amountField) bucket.amount += Number(row[amountField])
    buckets.set(label, bucket)
  }

  return [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label))
}
