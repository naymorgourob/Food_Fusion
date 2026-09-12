import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  ScrollText,
  Clock,
  Sparkles,
} from 'lucide-react'
import { fetchMenuItems } from '@/features/menu/services/menuItemService'
import { createOrder } from '@/features/orders/services/orderService'
import { money } from '@/utils/format'
import { getImageUrl } from '@/constants'

export function TakeOrderModal({
  isOpen,
  onClose,
  tables = [],
  preselectedTableId = null,
  initialGuestName = '',
  onOrderCreated,
}) {
  const [menuItems, setMenuItems] = useState([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [orderType, setOrderType] = useState('DINE_IN')
  const [selectedTableId, setSelectedTableId] = useState(preselectedTableId || '')
  const [guestName, setGuestName] = useState(initialGuestName || '')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Map of selected items: { [menuItemId]: quantity }
  const [cart, setCart] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (preselectedTableId) {
      setSelectedTableId(preselectedTableId)
      setOrderType('DINE_IN')
    }
    if (initialGuestName) {
      setGuestName(initialGuestName)
    }
  }, [preselectedTableId, initialGuestName])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    async function loadMenu() {
      setIsLoadingMenu(true)
      try {
        const data = await fetchMenuItems({ limit: 100 })
        if (!cancelled) setMenuItems(data.items || [])
      } catch (err) {
        if (!cancelled) setError('Failed to load menu items.')
      } finally {
        if (!cancelled) setIsLoadingMenu(false)
      }
    }

    loadMenu()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map()
    for (const item of menuItems) {
      if (item.category?.name) {
        map.set(item.category.id, item.category.name)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [menuItems])

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.isAvailable) return false
      if (selectedCategory && item.categoryId !== selectedCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const nameMatch = item.name.toLowerCase().includes(q)
        const descMatch = item.description?.toLowerCase().includes(q)
        if (!nameMatch && !descMatch) return false
      }
      return true
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Cart calculations
  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id)
        if (!item || qty <= 0) return null
        const price = Number(item.price)
        return {
          item,
          quantity: qty,
          unitPrice: price,
          subtotal: price * qty,
        }
      })
      .filter(Boolean)
  }, [cart, menuItems])

  const cartTotal = useMemo(() => {
    return cartEntries.reduce((sum, entry) => sum + entry.subtotal, 0)
  }, [cartEntries])

  const totalItemCount = useMemo(() => {
    return cartEntries.reduce((sum, entry) => sum + entry.quantity, 0)
  }, [cartEntries])

  function updateQuantity(itemId, delta) {
    setCart((prev) => {
      const current = prev[itemId] || 0
      const next = current + delta
      if (next <= 0) {
        const copy = { ...prev }
        delete copy[itemId]
        return copy
      }
      return { ...prev, [itemId]: next }
    })
  }

  function removeItem(itemId) {
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[itemId]
      return copy
    })
  }

  function resetForm() {
    setCart({})
    setSelectedTableId(preselectedTableId || '')
    setGuestName('')
    setSpecialInstructions('')
    setError('')
  }

  async function handleSubmitOrder(e) {
    e?.preventDefault?.()
    setError('')

    if (cartEntries.length === 0) {
      setError('Please add at least one menu item to the order.')
      return
    }

    if (orderType === 'DINE_IN' && !selectedTableId) {
      setError('Please select a table for Dine-In orders.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        orderType,
        items: cartEntries.map((e) => ({
          menuItemId: e.item.id,
          quantity: e.quantity,
        })),
        specialInstructions: specialInstructions.trim() || undefined,
      }

      if (orderType === 'DINE_IN') {
        payload.tableId = selectedTableId
      }

      await createOrder(payload)
      resetForm()
      onClose()
      onOrderCreated?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-rule bg-card shadow-2xl"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-rule bg-canvas-2 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-body">Take New Order</h2>
                <p className="text-xs text-body-muted">
                  Floor order terminal · Dine-in table service & takeaway
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-body-muted hover:bg-canvas hover:text-body"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Content: Split 2 columns (Menu catalog on left, Ticket summary on right) */}
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            {/* Left: Menu catalog */}
            <div className="flex flex-1 flex-col overflow-y-auto border-r border-rule p-4 sm:p-5">
              {/* Order Context Row (Dine-In vs Takeaway, Table Selector) */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rule bg-canvas-2 p-3">
                <div className="flex rounded-xl bg-card p-1 shadow-sm border border-rule">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      orderType === 'DINE_IN'
                        ? 'bg-brand-700 text-white'
                        : 'text-body-muted hover:text-body'
                    }`}
                  >
                    <Armchair className="h-3.5 w-3.5" /> Dine-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-brand-700 text-white'
                        : 'text-body-muted hover:text-body'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Takeaway
                  </button>
                </div>

                {orderType === 'DINE_IN' && (
                  <div className="flex flex-1 items-center gap-2 min-w-[200px]">
                    <label htmlFor="table-select" className="text-xs font-bold text-body whitespace-nowrap">
                      Table:
                    </label>
                    <select
                      id="table-select"
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full rounded-xl border border-rule bg-card px-3 py-2 text-xs font-semibold text-body focus:border-brand-500 focus:outline-none"
                    >
                      <option value="">-- Choose Dining Table --</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Table #{t.number} ({t.capacity} seats) · {t.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Search & Category Filter */}
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-body-faint" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dish name or ingredient…"
                    className="w-full rounded-xl border border-rule bg-canvas-2 py-2 pr-4 pl-9 text-xs text-body placeholder:text-body-faint focus:border-brand-400 focus:outline-none"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                      selectedCategory === ''
                        ? 'bg-brand-700 text-white'
                        : 'bg-canvas-2 text-body-muted hover:bg-canvas'
                    }`}
                  >
                    All Dishes
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                        selectedCategory === cat.id
                          ? 'bg-brand-700 text-white'
                          : 'bg-canvas-2 text-body-muted hover:bg-canvas'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="mt-4 flex-1">
                {isLoadingMenu ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="skeleton h-28 rounded-2xl" />
                    <div className="skeleton h-28 rounded-2xl" />
                    <div className="skeleton h-28 rounded-2xl" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-body-faint">
                    No available dishes match your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((dish) => {
                      const inCartQty = cart[dish.id] || 0
                      return (
                        <div
                          key={dish.id}
                          className={`flex flex-col justify-between rounded-2xl border p-3 transition ${
                            inCartQty > 0
                              ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
                              : 'border-rule bg-card hover:border-brand-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-xs text-body line-clamp-1">
                                {dish.name}
                              </span>
                              <span className="font-bold text-xs text-brand-700 dark:text-brand-400 whitespace-nowrap">
                                {money(dish.price)}
                              </span>
                            </div>
                            {dish.description && (
                              <p className="mt-1 line-clamp-2 text-[0.7rem] text-body-faint">
                                {dish.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-rule pt-2">
                            {inCartQty > 0 ? (
                              <div className="flex w-full items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(dish.id, -1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-rule bg-card text-body hover:bg-canvas-2"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-bold text-xs text-body">{inCartQty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(dish.id, 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-white hover:bg-brand-800"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateQuantity(dish.id, 1)}
                                className="flex w-full items-center justify-center gap-1 rounded-xl bg-canvas-2 py-1.5 text-xs font-semibold text-body hover:bg-brand-50 hover:text-brand-700 transition"
                              >
                                <Plus className="h-3 w-3" /> Add to Order
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Ticket & Submission */}
            <div className="flex w-full flex-col justify-between border-t border-rule bg-canvas-2 p-4 sm:p-5 md:w-80 md:border-t-0 lg:w-96">
              <div>
                <div className="flex items-center justify-between border-b border-rule pb-3">
                  <span className="font-display text-sm font-bold text-body">
                    Kitchen Ticket Summary
                  </span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.65rem] font-bold text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                    <AlertTriangle className="h-4 w-4 flex-none text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Ticket Items List */}
                <div className="mt-3 max-h-[35vh] overflow-y-auto">
                  {cartEntries.length === 0 ? (
                    <div className="py-8 text-center text-xs text-body-faint">
                      No dishes added yet. Click &ldquo;+ Add&rdquo; on any menu item.
                    </div>
                  ) : (
                    <ul className="flex flex-col divide-y divide-rule text-xs">
                      {cartEntries.map(({ item, quantity, subtotal }) => (
                        <li key={item.id} className="flex items-center justify-between py-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-body">{item.name}</span>
                            <span className="text-[0.7rem] text-body-faint">
                              {quantity} × {money(item.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-body">{money(subtotal)}</span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-body-faint hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Special Instructions Note */}
                <div className="mt-4">
                  <label htmlFor="special-notes" className="flex items-center gap-1.5 text-xs font-semibold text-body">
                    <ScrollText className="h-3.5 w-3.5 text-amber-600" /> Special Kitchen Note:
                  </label>
                  <textarea
                    id="special-notes"
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="E.g. No onions, dressing on side, allergy note…"
                    className="mt-1.5 w-full rounded-xl border border-rule bg-card p-2.5 text-xs text-body placeholder:text-body-faint focus:border-brand-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total & Send Button */}
              <div className="mt-4 border-t border-rule pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-body-muted">Order Total:</span>
                  <span className="font-display text-xl font-bold text-body">
                    {money(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cartEntries.length === 0}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brand-800 disabled:opacity-50"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  {isSubmitting ? 'Sending to Kitchen…' : 'Send Order to Kitchen'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
