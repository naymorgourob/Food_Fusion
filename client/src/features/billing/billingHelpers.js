/**
 * Billing helpers, status configs, and filtering/sorting logic (UI-08).
 */

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'PAID', label: 'Paid Only' },
  { value: 'UNPAID', label: 'Unpaid / Pending' },
]

export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest bill date' },
  { value: 'date-asc', label: 'Oldest bill date' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
  { value: 'unpaid-first', label: 'Pending payment first' },
  { value: 'bill-number-desc', label: 'Bill # (High to Low)' },
]

export const PAYMENT_STATUS_CONFIG = {
  PAID: {
    label: 'Paid',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  UNPAID: {
    label: 'Pending Payment',
    badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
}

export function filterBills(bills, { search, status }) {
  const query = search.trim().toLowerCase()
  return bills.filter((bill) => {
    if (query) {
      const matchBillNum = String(bill.billNumber).includes(query)
      const matchOrderNum = String(bill.order?.orderNumber).includes(query)
      const matchCustomer = bill.order?.customer?.fullName?.toLowerCase().includes(query)
      const matchEmail = bill.order?.customer?.email?.toLowerCase().includes(query)
      const matchPhone = bill.order?.customer?.phone?.toLowerCase().includes(query)
      if (!matchBillNum && !matchOrderNum && !matchCustomer && !matchEmail && !matchPhone) {
        return false
      }
    }

    if (status && bill.paymentStatus !== status) {
      return false
    }

    return true
  })
}

export function sortBills(bills, sortBy) {
  const list = [...bills]

  if (sortBy === 'unpaid-first') {
    return list.sort((a, b) => {
      if (a.paymentStatus === 'UNPAID' && b.paymentStatus === 'PAID') return -1
      if (a.paymentStatus === 'PAID' && b.paymentStatus === 'UNPAID') return 1
      return new Date(b.billDate) - new Date(a.billDate)
    })
  }

  if (sortBy === 'date-asc') {
    return list.sort((a, b) => new Date(a.billDate) - new Date(b.billDate))
  }
  if (sortBy === 'amount-desc') {
    return list.sort((a, b) => Number(b.grandTotal) - Number(a.grandTotal))
  }
  if (sortBy === 'amount-asc') {
    return list.sort((a, b) => Number(a.grandTotal) - Number(b.grandTotal))
  }
  if (sortBy === 'bill-number-desc') {
    return list.sort((a, b) => Number(b.billNumber) - Number(a.billNumber))
  }

  // 'date-desc' (default)
  return list.sort((a, b) => new Date(b.billDate) - new Date(a.billDate))
}

