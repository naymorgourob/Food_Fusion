/**
 * Client-side search/filter/sort for Admin Table Management (UI-08.6).
 *
 * GET /tables has no query parameters — the full set is fetched once and
 * all filtering is applied here against the in-memory result, following
 * the same pattern as adminReservationHelpers.js.
 */

export const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'INACTIVE', label: 'Inactive' },
]

export const CAPACITY_FILTERS = [
  { value: '', label: 'Any capacity' },
  { value: '1-2', label: '1–2 seats' },
  { value: '3-4', label: '3–4 seats' },
  { value: '5-6', label: '5–6 seats' },
  { value: '7+', label: '7+ seats' },
]

export const SORT_OPTIONS = [
  { value: 'number', label: 'Table number' },
  { value: 'capacity-asc', label: 'Smallest first' },
  { value: 'capacity-desc', label: 'Largest first' },
  { value: 'status', label: 'Status' },
]

/** Status visual configuration — single source of truth for every component. */
export const TABLE_STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    dotClass: 'bg-success',
    badgeClass: 'bg-success-soft text-success',
    cardBorderClass: 'border-success/30',
    cardBgClass: 'bg-success-soft/20',
  },
  OCCUPIED: {
    label: 'Occupied',
    dotClass: 'bg-danger',
    badgeClass: 'bg-danger-soft text-danger',
    cardBorderClass: 'border-danger/30',
    cardBgClass: 'bg-danger-soft/20',
  },
  RESERVED: {
    label: 'Reserved',
    dotClass: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning',
    cardBorderClass: 'border-warning/30',
    cardBgClass: 'bg-warning-soft/20',
  },
  INACTIVE: {
    label: 'Inactive',
    dotClass: 'bg-ink-faint',
    badgeClass: 'bg-surface-2 text-ink-muted',
    cardBorderClass: 'border-border',
    cardBgClass: '',
  },
}

function matchesCapacity(table, capacityFilter) {
  if (!capacityFilter) return true
  const cap = table.capacity
  if (capacityFilter === '1-2') return cap >= 1 && cap <= 2
  if (capacityFilter === '3-4') return cap >= 3 && cap <= 4
  if (capacityFilter === '5-6') return cap >= 5 && cap <= 6
  return cap >= 7 // '7+'
}

export function filterTables(tables, { search, status, capacity }) {
  const query = search.trim().toLowerCase()
  return tables.filter((table) => {
    if (query) {
      const matches =
        `table ${table.number}`.includes(query) ||
        String(table.number).includes(query) ||
        (table.description && table.description.toLowerCase().includes(query))
      if (!matches) return false
    }
    if (status && table.status !== status) return false
    if (!matchesCapacity(table, capacity)) return false
    return true
  })
}

export function sortTables(tables, sortBy) {
  const list = [...tables]
  if (sortBy === 'capacity-asc') return list.sort((a, b) => a.capacity - b.capacity)
  if (sortBy === 'capacity-desc') return list.sort((a, b) => b.capacity - a.capacity)
  if (sortBy === 'status') return list.sort((a, b) => a.status.localeCompare(b.status))
  return list.sort((a, b) => a.number - b.number) // 'number' (default)
}
