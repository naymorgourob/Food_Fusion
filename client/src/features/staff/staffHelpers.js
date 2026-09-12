/**
 * Staff management helpers, constants, and filtering utilities (UI-08.8).
 */

export const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active Only' },
  { value: 'INACTIVE', label: 'Inactive Only' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest joined' },
  { value: 'oldest', label: 'Oldest joined' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'name-desc', label: 'Name (Z to A)' },
  { value: 'position-asc', label: 'Position (A to Z)' },
  { value: 'most-assigned', label: 'Most assigned orders' },
]

export const COMMON_POSITIONS = [
  'Head Chef',
  'Sous Chef',
  'Line Cook',
  'Pastry Chef',
  'Server',
  'Waiter',
  'Bartender',
  'Host',
  'Floor Manager',
  'Sommelier',
]

export const STAFF_STATUS_CONFIG = {
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

/**
 * Returns color tokens according to restaurant department
 */
export function getPositionTone(position = '') {
  const pos = position.toLowerCase()
  if (pos.includes('chef') || pos.includes('cook') || pos.includes('kitchen') || pos.includes('baker') || pos.includes('pastry')) {
    return {
      name: 'culinary',
      badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300',
      dot: 'bg-amber-500',
    }
  }
  if (pos.includes('manager') || pos.includes('supervisor') || pos.includes('lead') || pos.includes('captain') || pos.includes('director')) {
    return {
      name: 'management',
      badge: 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300',
      dot: 'bg-brand-600',
    }
  }
  if (pos.includes('server') || pos.includes('wait') || pos.includes('bar') || pos.includes('host') || pos.includes('sommelier')) {
    return {
      name: 'service',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    }
  }
  return {
    name: 'general',
    badge: 'border-rule bg-canvas-2 text-body-muted',
    dot: 'bg-body-muted',
  }
}

export function filterStaff(staffList, { search, status, position }) {
  const query = search.trim().toLowerCase()
  return staffList.filter((member) => {
    if (query) {
      const matchName = member.fullName?.toLowerCase().includes(query)
      const matchEmail = member.email?.toLowerCase().includes(query)
      const matchPhone = member.phone?.toLowerCase().includes(query)
      const matchPosition = member.position?.toLowerCase().includes(query)
      if (!matchName && !matchEmail && !matchPhone && !matchPosition) return false
    }

    if (status === 'ACTIVE' && !member.isActive) return false
    if (status === 'INACTIVE' && member.isActive) return false

    if (position && member.position?.toLowerCase() !== position.toLowerCase()) {
      return false
    }

    return true
  })
}

export function sortStaff(staffList, sortBy) {
  const list = [...staffList]

  if (sortBy === 'oldest') {
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  if (sortBy === 'name-asc') {
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }
  if (sortBy === 'name-desc') {
    return list.sort((a, b) => b.fullName.localeCompare(a.fullName))
  }
  if (sortBy === 'position-asc') {
    return list.sort((a, b) => (a.position || '').localeCompare(b.position || ''))
  }
  if (sortBy === 'most-assigned') {
    return list.sort((a, b) => (b._count?.assignedOrders ?? 0) - (a._count?.assignedOrders ?? 0))
  }

  // 'newest' (default)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

