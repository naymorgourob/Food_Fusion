import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  CalendarPlus,
  Radar,
  BookOpen,
  RotateCcw,
  ClipboardList,
  CalendarCheck,
  Receipt,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBills } from '@/features/billing/hooks/useBills'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useRecommendedItems } from '@/features/menu/hooks/useRecommendedItems'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { OrderTypeBadge } from '@/features/orders/components/OrderTypeBadge'
import { ActiveOrderCard } from '@/features/orders/components/ActiveOrderCard'
import { StatusBadge as ReservationStatusBadge } from '@/features/reservations/components/StatusBadge'
import { PaymentStatusBadge } from '@/features/billing/components/PaymentStatusBadge'
import { LoyaltyCard } from '@/features/loyalty/components/LoyaltyCard'
import { DishCard } from '@/features/menu/components/DishCard'
import { orderGrandTotal } from '@/features/orders/constants'
import { OCCASION_LABELS } from '@/features/reservations/constants'
import { Card, SectionTitle, SkeletonCard, EmptyState, Rise } from '@/components/customer/ui'
import { money, orderNo } from '@/utils/format'
import { AMBIENCE_IMAGE } from '@/pages/landing/content'
import { ROUTES } from '@/constants'

const ACTIVE_ORDER_STATUSES = new Set(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'])
const UPCOMING_RESERVATION_STATUSES = new Set(['PENDING', 'CONFIRMED'])

const QUICK_ACTIONS = [
  { label: 'Order Food', to: `${ROUTES.ORDERS}/new`, icon: UtensilsCrossed },
  { label: 'Reserve Table', to: ROUTES.RESERVATIONS, icon: CalendarPlus },
  { label: 'Track Order', to: ROUTES.ORDERS, icon: Radar },
  { label: 'View Menu', to: `${ROUTES.ORDERS}/new`, icon: BookOpen },
  { label: 'Reorder', to: ROUTES.ORDERS, icon: RotateCcw },
]

function todayAtMidnight() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * The customer's home screen.
 *
 * Orders, reservations, and loyalty arrive from CustomerShell — the shell
 * already fetches them for the top bar's notifications and cart badge, so
 * re-calling those hooks here would double every request. Bills,
 * favourites, and recommendations are dashboard-only, so they stay local.
 *
 * `context` is passed as a prop because /account sits outside the
 * Customer-gated route branch (Staff shares that path), so there is no
 * Outlet context to read — see Account.jsx.
 */
export function CustomerDashboard({ context }) {
  const { user } = useAuth()
  const { orders: ordersState, reservations: reservationsState, loyalty } = context

  const { orders, isLoading: ordersLoading } = ordersState
  const { reservations, isLoading: reservationsLoading } = reservationsState
  const { summary: loyaltySummary, isLoading: loyaltyLoading } = loyalty

  const { bills, isLoading: billsLoading } = useBills()
  const { favorites, isLoading: favoritesLoading, isFavorite, toggleFavorite, pendingId } = useFavorites()
  const { items: recommended, isLoading: recommendedLoading } = useRecommendedItems(8)

  // Newest first — orders arrive sorted by createdAt desc from the API.
  const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.has(order.status))
  const currentOrder = activeOrders[0] ?? null
  const recentOrders = orders.slice(0, 4)
  const upcomingReservations = reservations
    .filter(
      (reservation) =>
        UPCOMING_RESERVATION_STATUSES.has(reservation.status) &&
        new Date(reservation.reservationDate) >= todayAtMidnight(),
    )
    .slice(0, 3)
  const recentPayments = bills.slice(0, 4)

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* --- Welcome hero ------------------------------------------------ */}
      <Rise>
        <section className="relative isolate overflow-hidden rounded-3xl">
          <img
            src={AMBIENCE_IMAGE.src}
            alt=""
            aria-hidden
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900/95 via-brand-900/85 to-brand-900/50" />

          <div className="flex flex-col gap-6 p-7 sm:p-10">
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2.5">
                <span className="h-px w-7 bg-gold-300" />
                <span className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
                  Tonight at FoodFusion
                </span>
              </span>
              <h1 className="max-w-xl font-display text-2xl leading-tight font-semibold text-white text-balance sm:text-3xl lg:text-4xl">
                Welcome back, {firstName}. Your table is always ready.
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                The autumn tasting menu has just landed — and members earn double points on dine-in
                orders this week.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`${ROUTES.ORDERS}/new`}
                className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400"
              >
                Order food
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={ROUTES.RESERVATIONS}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <CalendarPlus className="h-4 w-4" />
                Reserve a table
              </Link>
            </div>
          </div>
        </section>
      </Rise>

      {/* --- Quick actions ----------------------------------------------- */}
      <Rise delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map(({ label, to, icon: Icon }) => (
            <Card
              as={Link}
              to={to}
              key={label}
              interactive
              className="group flex flex-col items-center gap-2.5 p-4 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-400">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-semibold text-body">{label}</span>
            </Card>
          ))}
        </div>
      </Rise>

      {/* --- Main grid ---------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Active order */}
          <Rise delay={0.1}>
            {ordersLoading ? (
              <SkeletonCard lines={4} />
            ) : currentOrder ? (
              <ActiveOrderCard order={currentOrder} />
            ) : (
              <EmptyState
                icon={UtensilsCrossed}
                title="No orders in progress"
                description="Your next meal is a couple of taps away — the kitchen is open now."
                actionLabel="Order food"
                to={`${ROUTES.ORDERS}/new`}
              />
            )}
          </Rise>

          {/* Recommended */}
          <Rise delay={0.15}>
            <section aria-labelledby="recommended-heading">
              <SectionTitle action="Full menu" to={`${ROUTES.ORDERS}/new`}>
                <span id="recommended-heading">Recommended for you</span>
              </SectionTitle>

              {recommendedLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonCard key={index} lines={2} />
                  ))}
                </div>
              ) : recommended.length === 0 ? (
                <EmptyState
                  compact
                  icon={BookOpen}
                  title="Menu coming soon"
                  description="Our kitchen is updating tonight's menu."
                />
              ) : (
                // Horizontal scroller: keeps large appetising imagery without
                // forcing a 4-column grid to shrink on smaller screens.
                <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
                  {recommended.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      isFavorite={isFavorite(dish.id)}
                      isPending={pendingId === dish.id}
                      onToggleFavorite={toggleFavorite}
                      className="w-44 flex-none snap-start sm:w-52"
                    />
                  ))}
                </div>
              )}
            </section>
          </Rise>

          {/* Recent orders */}
          <Rise delay={0.2}>
            <section aria-labelledby="recent-orders-heading">
              <SectionTitle action="View all" to={ROUTES.ORDERS}>
                <span id="recent-orders-heading">Recent orders</span>
              </SectionTitle>

              {ordersLoading ? (
                <SkeletonCard lines={3} />
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  compact
                  icon={ClipboardList}
                  title="No orders yet"
                  description="Once you place an order it will appear here."
                  actionLabel="Browse the menu"
                  to={`${ROUTES.ORDERS}/new`}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {recentOrders.map((order) => (
                    <Card key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm font-semibold text-body">
                            {orderNo(order.orderNumber)}
                          </span>
                          <OrderTypeBadge orderType={order.orderType} />
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="truncate text-xs text-body-muted">
                          {order.items.map((item) => `${item.menuItem.name} ×${item.quantity}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex flex-none items-center justify-between gap-3 sm:justify-end">
                        <span className="font-display text-sm font-semibold text-body">
                          {money(orderGrandTotal(order))}
                        </span>
                        <div className="flex gap-2">
                          <Link
                            to={`${ROUTES.ORDERS}/new?repeat=${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-xs font-semibold text-body-muted transition-colors hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Order again
                          </Link>
                          <Link
                            to={`${ROUTES.ORDERS}/${order.id}`}
                            className="inline-flex items-center rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </Rise>
        </div>

        {/* --- Right rail --------------------------------------------------- */}
        <div className="flex flex-col gap-6">
          <Rise delay={0.1}>
            <LoyaltyCard summary={loyaltySummary} isLoading={loyaltyLoading} />
          </Rise>

          {/* Upcoming reservations */}
          <Rise delay={0.15}>
            <section aria-labelledby="reservations-heading">
              <SectionTitle action="Manage" to={ROUTES.RESERVATIONS}>
                <span id="reservations-heading">Upcoming reservations</span>
              </SectionTitle>

              {reservationsLoading ? (
                <SkeletonCard lines={2} />
              ) : upcomingReservations.length === 0 ? (
                <EmptyState
                  compact
                  icon={CalendarCheck}
                  title="No upcoming bookings"
                  description="Reserve a table and we'll have it dressed for you."
                  actionLabel="Reserve a table"
                  to={ROUTES.RESERVATIONS}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingReservations.map((reservation) => (
                    <Card key={reservation.id} className="flex flex-col gap-2.5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="font-display text-sm font-semibold text-body">
                            {new Date(reservation.reservationDate).toLocaleDateString(undefined, {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span className="text-xs text-body-muted">{reservation.reservationTime}</span>
                        </div>
                        <ReservationStatusBadge status={reservation.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-body-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
                        </span>
                        <span>Table {reservation.table?.number}</span>
                        {reservation.occasion && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 font-semibold text-gold-700 dark:bg-gold-100/10 dark:text-gold-300">
                            <Sparkles className="h-3 w-3" />
                            {OCCASION_LABELS[reservation.occasion]}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </Rise>

          {/* Favorites */}
          <Rise delay={0.2}>
            <section aria-labelledby="favorites-heading">
              <SectionTitle action="View all" to={ROUTES.FAVORITES}>
                <span id="favorites-heading">Your favorites</span>
              </SectionTitle>

              {favoritesLoading ? (
                <SkeletonCard lines={2} />
              ) : favorites.length === 0 ? (
                <EmptyState
                  compact
                  icon={Heart}
                  title="No favorites yet"
                  description="Tap the heart on any dish to save it here."
                  actionLabel="Browse dishes"
                  to={`${ROUTES.ORDERS}/new`}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {favorites.slice(0, 4).map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      isFavorite
                      isPending={pendingId === dish.id}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          </Rise>

          {/* Payment summary */}
          <Rise delay={0.25}>
            <section aria-labelledby="payments-heading">
              <SectionTitle action="View all" to={ROUTES.BILLS}>
                <span id="payments-heading">Recent payments</span>
              </SectionTitle>

              {billsLoading ? (
                <SkeletonCard lines={3} />
              ) : recentPayments.length === 0 ? (
                <EmptyState
                  compact
                  icon={Receipt}
                  title="No payments yet"
                  description="Invoices appear here once your orders are billed."
                />
              ) : (
                <Card className="flex flex-col divide-y divide-rule">
                  {recentPayments.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-semibold text-body">
                          Invoice {orderNo(bill.billNumber)}
                        </span>
                        <span className="text-xs text-body-faint">
                          {new Date(bill.billDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <span className="font-display text-sm font-semibold text-body">
                          {money(bill.grandTotal)}
                        </span>
                        <PaymentStatusBadge status={bill.paymentStatus} />
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </section>
          </Rise>
        </div>
      </div>
    </div>
  )
}
