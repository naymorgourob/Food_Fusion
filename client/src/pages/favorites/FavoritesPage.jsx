import { Link, useNavigate } from 'react-router-dom'
import { UtensilsCrossed, ShoppingCart } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { getImageUrl, ROUTES } from '@/constants'

// Customer-only page. "Allow ordering directly from Favorites" is handled
// by handing the wizard a `favorites` query param — it seeds quantities
// from that list, so the ordering flow itself is reused unchanged rather
// than duplicated here.
export default function FavoritesPage() {
  const { favorites, isLoading, isFavorite, toggleFavorite, pendingId } = useFavorites()
  const navigate = useNavigate()

  function orderAllFavorites() {
    const ids = favorites.filter((item) => item.isAvailable).map((item) => item.id)
    navigate(`${ROUTES.ORDERS}/new?favorites=${ids.join(',')}`)
  }

  const availableCount = favorites.filter((item) => item.isAvailable).length

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link to={ROUTES.ACCOUNT} className="text-sm font-medium text-ink-muted hover:text-ink">
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3 font-semibold text-ink">My Favorites</h1>
        {availableCount > 0 && (
          <button
            onClick={orderAllFavorites}
            className="flex items-center gap-2 rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
          >
            <ShoppingCart className="h-4 w-4" /> Order All Favorites
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading favorites…</p>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface p-10 text-center">
          <UtensilsCrossed className="h-7 w-7 text-ink-faint" strokeWidth={1.5} />
          <p className="text-sm text-ink-muted">
            No favorites yet — tap the heart beside any dish while ordering to save it here.
          </p>
          <Link
            to={`${ROUTES.ORDERS}/new`}
            className="rounded-md bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favorites.map((item) => {
            const imageUrl = getImageUrl(item.imageUrl)
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-ink">{item.name}</span>
                  <span className="text-xs text-ink-muted">{item.category?.name}</span>
                  <span className="text-sm font-medium text-ink">${Number(item.price).toFixed(2)}</span>
                  {!item.isAvailable && <span className="text-xs text-danger">Currently unavailable</span>}
                </div>

                <FavoriteButton
                  isFavorite={isFavorite(item.id)}
                  isPending={pendingId === item.id}
                  onToggle={() => toggleFavorite(item.id)}
                  itemName={item.name}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
