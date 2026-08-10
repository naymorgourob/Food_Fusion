import { Heart } from 'lucide-react'

// Presentational only — the parent owns favorites state (useFavorites) so
// one list can drive many buttons without each one fetching separately.
export function FavoriteButton({ isFavorite, isPending, onToggle, itemName }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      aria-label={isFavorite ? `Remove ${itemName} from favorites` : `Add ${itemName} to favorites`}
      aria-pressed={isFavorite}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isFavorite ? 'text-danger hover:bg-danger-soft' : 'text-ink-faint hover:bg-surface-2 hover:text-ink-muted'
      }`}
    >
      <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
    </button>
  )
}
