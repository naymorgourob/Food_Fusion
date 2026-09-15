import { useState, useMemo } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Search,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Info,
} from 'lucide-react'
import { updateInventoryStock, recordInventoryUsage } from '@/features/inventory/services/inventoryService'
import {
  INVENTORY_STATUS_CONFIG,
  UNIT_LABELS,
  filterInventory,
} from '@/features/inventory/inventoryHelpers'
import { Card, SkeletonCard, EmptyState } from '@/components/customer/ui'

export default function ChefInventoryPage() {
  const { inventory } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeTab, setActiveTab] = useState(() => searchParams.get('status') || 'ALL')

  // Track inline editing values and loading states: { [id]: quantityNumber }
  const [editQuantities, setEditQuantities] = useState({})
  const [updatingId, setUpdatingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [usageQuantities, setUsageQuantities] = useState({})

  const items = inventory?.items || []
  const isLoading = inventory?.isLoading

  // KPI calculations
  const stats = useMemo(() => {
    let inStock = 0
    let lowStock = 0
    let outOfStock = 0

    for (const item of items) {
      if (item.status === 'OUT_OF_STOCK') outOfStock++
      else if (item.status === 'LOW_STOCK') lowStock++
      else inStock++
    }

    return {
      total: items.length,
      inStock,
      lowStock,
      outOfStock,
    }
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = filterInventory(items, {
      search: searchQuery,
      status: activeTab === 'ALL' ? '' : activeTab,
      category: categoryFilter,
    })

    // Sort shortages first by default in kitchen
    const statusPriority = { OUT_OF_STOCK: 0, LOW_STOCK: 1, IN_STOCK: 2 }
    return result.sort((a, b) => {
      const pDiff = (statusPriority[a.status] ?? 3) - (statusPriority[b.status] ?? 3)
      if (pDiff !== 0) return pDiff
      return a.itemName.localeCompare(b.itemName)
    })
  }, [items, searchQuery, activeTab, categoryFilter])

  // Categories present in current items
  const availableCategories = useMemo(() => {
    const set = new Set(items.map((it) => it.category).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  async function handleQuickAdjust(item, delta) {
    const currentQty = Number(item.quantity)
    const newQty = Math.max(0, currentQty + delta)
    if (newQty === currentQty) return

    setUpdatingId(item.id)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await updateInventoryStock(item.id, newQty)
      inventory.refetch()
      setSuccessMessage(`Updated ${item.itemName} to ${newQty} ${UNIT_LABELS[item.unit] || item.unit}`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update stock.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleSaveQuantity(item) {
    const rawVal = editQuantities[item.id]
    if (rawVal === undefined || rawVal === '') return
    const num = Number(rawVal)
    if (isNaN(num) || num < 0) {
      setErrorMessage('Please enter a valid non-negative quantity.')
      return
    }

    setUpdatingId(item.id)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await updateInventoryStock(item.id, num)
      inventory.refetch()
      setEditQuantities((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
      setSuccessMessage(`Updated ${item.itemName} stock to ${num} ${UNIT_LABELS[item.unit] || item.unit}`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update stock.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleMarkNeedRefill(item) {
    setUpdatingId(item.id)
    setErrorMessage('')
    try {
      await updateInventoryStock(item.id, 0)
      inventory.refetch()
      setSuccessMessage(`Marked ${item.itemName} as Refill Needed (0 remaining).`)
      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to mark refill request.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRecordUsage(item) {
    const quantityUsed = Number(usageQuantities[item.id])
    if (!Number.isFinite(quantityUsed) || quantityUsed <= 0) {
      setErrorMessage('Enter a usage quantity greater than zero.')
      return
    }
    setUpdatingId(item.id)
    setErrorMessage('')
    try {
      await recordInventoryUsage(item.id, { quantityUsed, usageDate: new Date().toISOString().slice(0, 10) })
      setUsageQuantities((current) => ({ ...current, [item.id]: '' }))
      inventory.refetch()
      setSuccessMessage(`Recorded ${quantityUsed} ${UNIT_LABELS[item.unit] || item.unit} used for ${item.itemName}.`)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to record inventory usage.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Kitchen Inventory</h1>
          <p className="text-sm text-body-muted">
            Track ingredients, adjust real-time stock levels, and flag items needing refill.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inventory?.refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-rule bg-card px-4 py-2 text-xs font-semibold text-body shadow-sm transition hover:bg-canvas-2 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stock
        </button>
      </div>

      {/* Success / Error Banners */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card
          onClick={() => {
            setActiveTab('ALL')
            setSearchParams({})
          }}
          className={`cursor-pointer p-4 transition-all hover:scale-[1.01] ${activeTab === 'ALL' ? 'ring-2 ring-brand-500' : ''}`}
        >
          <div className="flex items-center justify-between text-body-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Total Items</span>
            <Package className="h-4 w-4 text-body-faint" />
          </div>
          <div className="mt-2 text-2xl font-bold text-body">{stats.total}</div>
          <div className="text-[0.7rem] text-body-faint">Catalog ingredients</div>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('IN_STOCK')
            setSearchParams({ status: 'IN_STOCK' })
          }}
          className={`cursor-pointer p-4 transition-all hover:scale-[1.01] ${activeTab === 'IN_STOCK' ? 'ring-2 ring-emerald-500' : ''}`}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-medium uppercase tracking-wider">In Stock</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.inStock}</div>
          <div className="text-[0.7rem] text-body-faint">Optimal quantity</div>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('LOW_STOCK')
            setSearchParams({ status: 'LOW_STOCK' })
          }}
          className={`cursor-pointer p-4 transition-all hover:scale-[1.01] ${activeTab === 'LOW_STOCK' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-medium uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.lowStock}</div>
          <div className="text-[0.7rem] text-body-faint">Below threshold</div>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('OUT_OF_STOCK')
            setSearchParams({ status: 'OUT_OF_STOCK' })
          }}
          className={`cursor-pointer p-4 transition-all hover:scale-[1.01] ${activeTab === 'OUT_OF_STOCK' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center justify-between text-red-700 dark:text-red-400">
            <span className="text-xs font-medium uppercase tracking-wider">Out of Stock</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</div>
          <div className="text-[0.7rem] text-body-faint">Needs urgent restock</div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body-faint" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kitchen item or category…"
            className="w-full rounded-xl border border-rule bg-canvas-2 py-2 pr-4 pl-9 text-xs text-body transition-colors placeholder:text-body-faint focus:border-brand-400 focus:outline-none"
          />
        </div>

        {/* Category Select */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="cat-filter" className="text-xs font-medium text-body-faint">
            Category:
          </label>
          <select
            id="cat-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-rule bg-canvas-2 px-3 py-2 text-xs text-body focus:border-brand-400 focus:outline-none"
          >
            <option value="">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-xs text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300">
        <Info className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
        <span>
          <strong>Kitchen Staff Access:</strong> You can view all kitchen ingredients, record live quantity changes,
          and flag items needing refills. Adding new inventory items or changing minimum thresholds is managed by
          administrators.
        </span>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchQuery || categoryFilter || activeTab !== 'ALL' ? 'No matching items' : 'Inventory is empty'}
          description={
            searchQuery || categoryFilter || activeTab !== 'ALL'
              ? 'Try changing your search filters or status tab.'
              : 'Ingredients created by the manager will appear here.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const statusConfig = INVENTORY_STATUS_CONFIG[item.status] || INVENTORY_STATUS_CONFIG.IN_STOCK
            const isEditing = editQuantities[item.id] !== undefined
            const isItemUpdating = updatingId === item.id
            const unitLabel = UNIT_LABELS[item.unit] || item.unit

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-display text-base font-semibold text-body">{item.itemName}</span>
                      <span className="text-xs text-body-faint">{item.category}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${statusConfig.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Stock numbers */}
                  <div className="mt-4 flex items-baseline justify-between rounded-xl bg-canvas-2 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-body-faint">
                        In Stock
                      </span>
                      <span className="text-lg font-bold text-body">
                        {Number(item.quantity)} <span className="text-xs font-normal text-body-muted">{unitLabel}</span>
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-body-faint">
                        Min Level
                      </span>
                      <span className="text-xs font-semibold text-body-muted">
                        {Number(item.minStockLevel)} {unitLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chef Quick Controls */}
                <div className="mt-4 border-t border-rule pt-3">
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={usageQuantities[item.id] ?? ''}
                      onChange={(event) => setUsageQuantities((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="Used"
                      aria-label={`Quantity used for ${item.itemName}`}
                      className="w-24 rounded-lg border border-rule bg-canvas px-2 py-1.5 text-xs text-body"
                    />
                    <button
                      type="button"
                      onClick={() => handleRecordUsage(item)}
                      disabled={isItemUpdating}
                      className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Record usage
                    </button>
                  </div>
                  {item.usages?.[0] && (
                    <p className="mb-3 text-[0.7rem] text-body-faint">
                      Last used {Number(item.usages[0].quantityUsed)} {unitLabel} on {new Date(item.usages[0].usageDate).toLocaleDateString()} by {item.usages[0].recordedBy?.fullName || 'staff'}; remaining {Number(item.usages[0].remainingQuantity)} {unitLabel}.
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-body-faint">Quick Adjust:</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item, -1)}
                        disabled={isItemUpdating || Number(item.quantity) <= 0}
                        title="Decrease by 1"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-rule bg-card text-body-muted transition hover:bg-canvas-2 hover:text-body disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={editQuantities[item.id]}
                            onChange={(e) =>
                              setEditQuantities((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-16 rounded-lg border border-brand-400 bg-canvas px-1.5 py-1 text-center text-xs font-semibold text-body focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveQuantity(item)}
                            disabled={isItemUpdating}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditQuantities((prev) => {
                                const next = { ...prev }
                                delete next[item.id]
                                return next
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-body-faint hover:bg-canvas-2"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setEditQuantities((prev) => ({
                              ...prev,
                              [item.id]: Number(item.quantity),
                            }))
                          }
                          className="rounded-lg border border-dashed border-rule px-2 py-1 text-xs text-body-faint transition hover:border-body-muted hover:text-body"
                          title="Click to enter exact amount"
                        >
                          Set exact
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item, 1)}
                        disabled={isItemUpdating}
                        title="Increase by 1"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-rule bg-card text-body-muted transition hover:bg-canvas-2 hover:text-body disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Need Refill Button if stock is low or out */}
                  {item.status !== 'IN_STOCK' && (
                    <button
                      type="button"
                      onClick={() => handleMarkNeedRefill(item)}
                      disabled={isItemUpdating}
                      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 disabled:opacity-50"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {item.status === 'OUT_OF_STOCK' ? 'Out of Stock · Restock Urgent' : 'Refill Needed'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
