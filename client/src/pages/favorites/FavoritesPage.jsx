import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react'
import { CustomerFavoriteCard } from '@/features/favorites/components/CustomerFavoriteCard'
import { DishDetailModal } from '@/features/menu/components/DishDetailModal'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { ROUTES } from '@/constants'

export default function FavoritesPage() {
  const { favorites, isLoading, error, refetch, isFavorite, toggleFavorite, pendingId } = useFavorites()
  const [selectedDish, setSelectedDish] = useState(null)
  const navigate = useNavigate()

  const availableCount = favorites.filter((item) => item.isAvailable).length

  function orderAllFavorites() {
    const ids = favorites.filter((item) => item.isAvailable).map((item) => item.id)
    if (ids.length > 0) {
      navigate(`${ROUTES.ORDERS}/new?favorites=${ids.join(',')}`)
    }
  }

  function handleOrderDish(dish) {
    if (dish?.isAvailable) {
      navigate(`${ROUTES.ORDERS}/new?favorites=${dish.id}`)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-body">
              Favorites
            </h1>
            {!isLoading && favorites.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 ring-1 ring-inset ring-brand-700/10">
                {favorites.length} {favorites.length === 1 ? 'dish' : 'dishes'}
              </span>
            )}
          </div>
          <p className="text-sm text-body-muted">
            Your favorite dishes.
          </p>
        </div>

        {availableCount > 0 && (
          <button
            type="button"
            onClick={orderAllFavorites}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Order All Favorites ({availableCount})</span>
          </button>
        )}
      </div>

      {/* --- Page Content --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-2xl border border-rule bg-card animate-pulse"
            >
              <div className="aspect-[16/10] w-full bg-canvas-2" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 w-3/4 rounded bg-rule" />
                <div className="h-3 w-1/2 rounded bg-rule/60" />
                <div className="pt-2 border-t border-rule/50 flex justify-between items-center">
                  <div className="h-4 w-16 rounded bg-rule" />
                  <div className="h-7 w-16 rounded-xl bg-rule" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="font-medium text-body">Unable to load favorites</p>
          <p className="text-sm text-body-muted max-w-md">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rule bg-card/40 px-6 py-16 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/40 ring-1 ring-brand-700/20">
            <Heart className="h-8 w-8 text-brand-700 dark:text-brand-400" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1.5 max-w-sm">
            <h3 className="font-display text-lg font-semibold text-body">
              No favorites yet.
            </h3>
            <p className="text-sm text-body-muted">
              Explore our menu and tap the heart icon on any dish to save it here for quick ordering.
            </p>
          </div>
          <Link
            to={`${ROUTES.ORDERS}/new`}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:scale-[0.98]"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Browse Menu</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((dish) => (
            <CustomerFavoriteCard
              key={dish.id}
              dish={dish}
              isFavorite={isFavorite(dish.id)}
              isPending={pendingId === dish.id}
              onToggleFavorite={toggleFavorite}
              onSelect={(d) => setSelectedDish(d)}
              onOrder={handleOrderDish}
            />
          ))}
        </div>
      )}

      {/* --- Dish Detail Modal --- */}
      <DishDetailModal
        key={selectedDish?.id ?? 'none'}
        dish={selectedDish}
        isOpen={Boolean(selectedDish)}
        onClose={() => setSelectedDish(null)}
        onAdd={handleOrderDish}
        isFavorite={selectedDish ? isFavorite(selectedDish.id) : false}
        isPending={pendingId === selectedDish?.id}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
