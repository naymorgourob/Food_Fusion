import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuBrowser } from '@/features/menu/components/MenuBrowser'
import { DishDetailModal } from '@/features/menu/components/DishDetailModal'
import { CartDrawer } from '@/features/orders/components/CartDrawer'
import { AddedToCartToast } from '@/features/orders/components/AddedToCartToast'
import { CheckoutPanel } from '@/features/orders/components/CheckoutPanel'
import { OrderSuccess } from '@/features/orders/components/OrderSuccess'
import { PAYMENT_METHODS } from '@/features/orders/components/PaymentMethodStep'
import { useCart } from '@/features/orders/hooks/useCart'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useLoyalty } from '@/features/loyalty/hooks/useLoyalty'
import { fetchTables } from '@/features/tables/services/tableService'
import { createOrder, fetchOrderById } from '@/features/orders/services/orderService'

// Must match DELIVERY_CHARGE in server/src/services/order.service.js —
// this is a display-only preview, the server applies the real charge.
const DELIVERY_CHARGE_PREVIEW = 3.0

function computeSuggestedReadyTime(arrivalLocal) {
  if (!arrivalLocal) return null
  const arrival = new Date(arrivalLocal)
  if (Number.isNaN(arrival.getTime())) return null
  const suggested = new Date(arrival.getTime() - 5 * 60000)
  return suggested.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Customer ordering (UI-03 redesign of the Smart Ordering flow).
 *
 * The flow changed shape: dishes are now chosen by browsing a real menu
 * and adding to a cart, then checkout asks only for order type and the
 * details that type needs. The old four-step wizard put a spreadsheet-like
 * quantity table *inside* step 3, which is not how anyone chooses food.
 *
 * What did NOT change is everything the server cares about: the payload
 * built in handleSubmit, the per-type required fields, the loyalty clamp,
 * and createOrder are carried over from SmartOrderWizard unchanged.
 *
 * Two optional query params still pre-seed the cart (Part 18.1):
 *   ?repeat=<orderId>       — "Order Again" from order history
 *   ?favorites=<id,id,...>  — "Order All Favorites" from the Favorites page
 *   ?q=<text>               — search handed over from the top bar
 */
export default function NewOrderPage() {
  const [searchParams] = useSearchParams()

  const repeatOrderId = searchParams.get('repeat')
  const favoritesParam = searchParams.get('favorites')
  const favoriteIds = useMemo(
    () => (favoritesParam ? favoritesParam.split(',').filter(Boolean) : null),
    [favoritesParam],
  )

  // Seeded straight into cart state — these ids arrive as props/params, so
  // this is derived initial state rather than a synchronising effect.
  const cart = useCart(
    useMemo(
      () => (favoriteIds?.length ? Object.fromEntries(favoriteIds.map((id) => [id, 1])) : {}),
      [favoriteIds],
    ),
  )

  const favorites = useFavorites()
  const { summary: loyaltySummary } = useLoyalty()

  const [mode, setMode] = useState('browse') // 'browse' | 'checkout' | 'success'
  const [placedOrder, setPlacedOrder] = useState(null)
  const [placedTotal, setPlacedTotal] = useState(0)
  const [quickViewDish, setQuickViewDish] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  const [step, setStep] = useState(0)
  // Tracks how far the customer has got, so the step rail can offer
  // backward jumps without letting anyone skip ahead past required fields.
  const [furthestReached, setFurthestReached] = useState(0)
  const [orderType, setOrderType] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const [dineInMode, setDineInMode] = useState('now')
  const [tableId, setTableId] = useState('')
  const [scheduledArrivalTime, setScheduledArrivalTime] = useState('')
  const [guestCount, setGuestCount] = useState('')

  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [scheduledPickupTime, setScheduledPickupTime] = useState('')

  const [specialInstructions, setSpecialInstructions] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState('')

  const [tables, setTables] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  useEffect(() => {
    fetchTables()
      .then((data) => setTables(data.filter((table) => table.status !== 'INACTIVE')))
      .catch(() => setTables([]))
  }, [])

  // "Order Again" needs an effect because the previous order must be
  // fetched before its lines can seed the cart.
  useEffect(() => {
    if (!repeatOrderId) return undefined
    let cancelled = false

    async function seedFromPreviousOrder() {
      try {
        const order = await fetchOrderById(repeatOrderId)
        if (cancelled) return
        for (const item of order.items) {
          cart.setQuantity(item.menuItemId, item.quantity)
        }
      } catch {
        // A missing or inaccessible order just means no seeding.
      }
    }

    seedFromPreviousOrder()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per id; cart identity changes every render
  }, [repeatOrderId])

  const itemsTotal = cart.subtotal
  const deliveryChargePreview = orderType === 'DELIVERY' ? DELIVERY_CHARGE_PREVIEW : 0

  // Preview only — order.service.js recomputes all of this server-side,
  // including capping the discount at the food total (which is why this
  // clamps the same way rather than trusting the raw input).
  const pointValue = loyaltySummary?.pointValue ?? 0
  const requestedPoints = Math.max(0, Math.floor(Number(pointsToRedeem) || 0))
  const appliedPoints = Math.min(
    requestedPoints,
    loyaltySummary?.currentPoints ?? 0,
    pointValue > 0 ? Math.ceil(itemsTotal / pointValue) : 0,
  )
  const loyaltyDiscount = Math.min(appliedPoints * pointValue, itemsTotal)
  const grandTotal = itemsTotal + deliveryChargePreview - loyaltyDiscount

  function canLeaveDetailsStep() {
    if (orderType === 'DELIVERY') return Boolean(deliveryAddress.trim() && deliveryPhone.trim())
    if (orderType === 'TAKEAWAY') return Boolean(scheduledPickupTime)
    if (orderType === 'DINE_IN') return dineInMode === 'now' || Boolean(scheduledArrivalTime && guestCount)
    return false
  }

  function handleAdd(dish, quantity = 1, notes = '') {
    cart.add(dish, quantity, notes)
  }

  function goToCheckout() {
    setCartOpen(false)
    setMode('checkout')
    changeStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function changeStep(next) {
    setStep(next)
    setFurthestReached((current) => Math.max(current, next))
    setErrors([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function backToMenu() {
    setMode('browse')
    setErrors([])
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setErrors([])
    try {
      // Per-dish notes are folded into the order's special instructions:
      // OrderItem has no notes column, and adding one would be a schema
      // change. Prefixing with the dish name keeps them intelligible to
      // the kitchen.
      const lineNotes = cart.items
        .filter(({ notes }) => notes)
        .map(({ item, notes }) => `${item.name}: ${notes}`)
      const combinedInstructions = [specialInstructions.trim(), ...lineNotes]
        .filter(Boolean)
        .join(' | ')

      const payload = {
        orderType,
        items: cart.items.map(({ item, quantity }) => ({ menuItemId: item.id, quantity })),
        specialInstructions: combinedInstructions || undefined,
        // Sends the raw request, not the clamped preview — the server does
        // its own capping against the live balance and order total.
        pointsToRedeem: requestedPoints > 0 ? requestedPoints : undefined,
      }

      if (orderType === 'DINE_IN') {
        payload.tableId = tableId || undefined
        if (dineInMode === 'schedule') {
          payload.scheduledArrivalTime = new Date(scheduledArrivalTime).toISOString()
          payload.guestCount = guestCount
        }
      } else if (orderType === 'DELIVERY') {
        payload.deliveryAddress = deliveryAddress
        payload.deliveryPhone = deliveryPhone
      } else if (orderType === 'TAKEAWAY') {
        payload.scheduledPickupTime = new Date(scheduledPickupTime).toISOString()
      }

      const order = await createOrder(payload)
      // Show the confirmation rather than jumping straight to tracking —
      // the order number and total used to flash past unread.
      setPlacedOrder(order)
      setPlacedTotal(grandTotal)
      setMode('success')
      cart.clear()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setErrors(details && details.length > 0 ? details : [message])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col gap-8">
      {(repeatOrderId || favoriteIds) && mode === 'browse' && (
        <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
          {repeatOrderId
            ? 'We have added your previous order to the cart — adjust anything before checking out.'
            : 'We have added your favorites to the cart — adjust anything before checking out.'}
        </p>
      )}

      {mode === 'success' && placedOrder ? (
        <OrderSuccess
          order={placedOrder}
          total={placedTotal}
          paymentLabel={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? 'At the restaurant'}
        />
      ) : mode === 'browse' ? (
        <MenuBrowser
          cart={cart}
          favorites={favorites}
          onQuickView={setQuickViewDish}
          onAdd={handleAdd}
          initialSearch={searchParams.get('q') ?? ''}
        />
      ) : (
        <CheckoutPanel
          step={step}
          onStepChange={changeStep}
          furthestReached={furthestReached}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          dineIn={{
            mode: dineInMode,
            onModeChange: setDineInMode,
            tableId,
            onTableChange: setTableId,
            scheduledArrivalTime,
            onArrivalChange: setScheduledArrivalTime,
            guestCount,
            onGuestCountChange: setGuestCount,
          }}
          delivery={{
            address: deliveryAddress,
            onAddressChange: setDeliveryAddress,
            phone: deliveryPhone,
            onPhoneChange: setDeliveryPhone,
          }}
          takeaway={{ scheduledPickupTime, onPickupTimeChange: setScheduledPickupTime }}
          specialInstructions={specialInstructions}
          onSpecialInstructionsChange={setSpecialInstructions}
          tables={tables}
          suggestedReadyTime={computeSuggestedReadyTime(scheduledArrivalTime)}
          canLeaveDetails={canLeaveDetailsStep()}
          cart={cart}
          itemsTotal={itemsTotal}
          deliveryCharge={deliveryChargePreview}
          loyaltySummary={loyaltySummary}
          pointsToRedeem={pointsToRedeem}
          onPointsChange={setPointsToRedeem}
          appliedPoints={appliedPoints}
          loyaltyDiscount={loyaltyDiscount}
          grandTotal={grandTotal}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onBackToMenu={backToMenu}
        />
      )}

      {/* Floating cart button — the persistent way back to the order while
          browsing, so adding a dish never has to navigate anywhere. */}
      <AnimatePresence>
        {mode === 'browse' && cart.count > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={() => setCartOpen(true)}
            aria-label={`Open your order (${cart.count} ${cart.count === 1 ? 'item' : 'items'})`}
            className="fixed right-5 bottom-24 z-30 flex h-14 items-center gap-2.5 rounded-full bg-brand-800 px-5 text-white shadow-2xl shadow-brand-900/30 transition-all hover:-translate-y-0.5 hover:bg-brand-900 sm:bottom-6"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-bold">{cart.count}</span>
            <span className="hidden text-sm font-semibold sm:inline">· {cart.subtotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AddedToCartToast
        lastAdded={cart.lastAdded}
        count={cart.count}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        subtotal={cart.subtotal}
        count={cart.count}
        deliveryCharge={deliveryChargePreview}
        loyaltyDiscount={loyaltyDiscount}
        onSetQuantity={cart.setQuantity}
        onRemove={cart.remove}
        onCheckout={goToCheckout}
      />

      {/* Keyed so quantity and notes reset per dish rather than leaking. */}
      <DishDetailModal
        key={quickViewDish?.id ?? 'none'}
        dish={quickViewDish}
        isOpen={Boolean(quickViewDish)}
        onClose={() => setQuickViewDish(null)}
        onAdd={handleAdd}
        isFavorite={quickViewDish ? favorites.isFavorite(quickViewDish.id) : false}
        isPending={favorites.pendingId === quickViewDish?.id}
        onToggleFavorite={favorites.toggleFavorite}
      />
    </div>
  )
}
