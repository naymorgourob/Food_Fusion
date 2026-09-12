/**
 * Client-side search/filter/sort for Admin Customer Management (UI-08.7).
 *
 * GET /customers returns all customers — search and filtering are applied
 * in-memory to provide instant feedback matching the other redesigned
 * modules (Tables, Orders, Reservations).
 */

export const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active Only' },
  { value: 'INACTIVE', label: 'Inactive Only' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest registered' },
  { value: 'oldest', label: 'Oldest registered' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'name-desc', label: 'Name (Z to A)' },
  { value: 'most-orders', label: 'Most orders' },
]

export const CUSTOMER_STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    dotClass: 'bg-success',
    badgeClass: 'bg-success-soft text-success',
    borderClass: 'border-success/30',
  },
  INACTIVE: {
    label: 'Inactive',
    dotClass: 'bg-body-faint',
    badgeClass: 'bg-surface-2 text-body-muted',
    borderClass: 'border-border',
  },
}

export function filterCustomers(customers, { search, status }) {
  const query = search.trim().toLowerCase()
  return customers.filter((customer) => {
    if (query) {
      const matchName = customer.fullName?.toLowerCase().includes(query)
      const matchEmail = customer.email?.toLowerCase().includes(query)
      const matchPhone = customer.phone?.toLowerCase().includes(query)
      if (!matchName && !matchEmail && !matchPhone) return false
    }

    if (status === 'ACTIVE' && !customer.isActive) return false
    if (status === 'INACTIVE' && customer.isActive) return false

    return true
  })
}

export function sortCustomers(customers, sortBy) {
  const list = [...customers]

  if (sortBy === 'oldest') {
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  if (sortBy === 'name-asc') {
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }
  if (sortBy === 'name-desc') {
    return list.sort((a, b) => b.fullName.localeCompare(a.fullName))
  }
  if (sortBy === 'most-orders') {
    return list.sort((a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0))
  }

  // 'newest' (default)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
