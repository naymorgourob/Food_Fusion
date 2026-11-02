import { motion, useTransform } from 'framer-motion'
import { Clock, Flame, Star, Droplet, Pencil, Trash2 } from 'lucide-react'
import { Marker, FavoriteButton, CartControl } from '@/features/menu/components/DishCardParts'
import { useDishCardMotion } from '@/features/menu/hooks/useDishCardMotion'
import { isDrink, isNew, STRENGTH_LABELS, MILK_LABELS } from '@/features/menu/utils/dish'
import { FullPhoto } from '@/features/menu/components/FullPhoto'
import { money } from '@/utils/format'

function GuideBean({ filled }) {
  return (
    <svg viewBox="0 0 16 20" className="h-3.5 w-3" aria-hidden>
      <ellipse
        cx="8"
        cy="10"
        rx="6.5"
        ry="8.5"
        fill={filled ? '#C8894F' : 'none'}
        stroke={filled ? '#C8894F' : '#8A6B5A'}
        strokeWidth="1.4"
      />
      <path
        d="M8 2.5 C 5 7, 11 13, 8 17.5"
        fill="none"
        stroke={filled ? '#5A3219' : '#8A6B5A'}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// A roasted bean that floats beside the cup, like the loose beans around
// the reference's cards.
function FloatingBean({ className }) {
  return (
    <svg viewBox="0 0 40 52" className={className} aria-hidden>
      <defs>
        <linearGradient id="drink-bean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8A5530" />
          <stop offset="100%" stopColor="#3E2210" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="26" rx="17" ry="23" fill="url(#drink-bean)" />
      <path
        d="M20 5 C 12 18, 28 32, 20 47"
        fill="none"
        stroke="#2A160A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="13" cy="16" rx="4" ry="7" fill="#fff" fillOpacity="0.14" />
    </svg>
  )
}

// The coffee-menu guide: strength in beans, and how much milk goes in.
function DrinkGuide({ strength, milk }) {
  if (!strength && !milk) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium text-[#E3CFC0]">
      {strength ? (
        <span
          className="flex items-center gap-1.5"
          title={`Strength: ${STRENGTH_LABELS[strength]}`}
        >
          <span className="flex gap-0.5">
            {[1, 2, 3].map((level) => (
              <GuideBean key={level} filled={level <= strength} />
            ))}
          </span>
          {STRENGTH_LABELS[strength]}
        </span>
      ) : null}
      {milk ? (
        <span className="flex items-center gap-1">
          <Droplet
            className={`h-3.5 w-3.5 ${milk === 'NONE' ? 'text-[#8A6B5A]' : 'fill-[#F5E9DF]/80 text-[#F5E9DF]'}`}
          />
          {MILK_LABELS[milk]}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Menu card in the coffee-house style, used for every dish and drink: the
 * photo in a tile that stands up out of a roasted-brown glass card (with
 * loose beans floating beside drinks), centred name and description, then
 * price and a round teal add button. Coffees also show the strength and
 * milk guide.
 */
export function DrinkCard({
  dish,
  quantity = 0,
  isFavorite = false,
  isPending = false,
  onToggleFavorite,
  onQuickView,
  onAdd,
  onSetQuantity,
  onEdit,
  onDelete,
}) {
  // Admin mode (the admin menu page): same card customers see, with
  // Edit / Delete and an availability badge in place of the cart button.
  const admin = Boolean(onEdit || onDelete)
  const unavailable = !dish.isAvailable
  // Loose coffee beans only make sense beside drinks, not food.
  const drink = isDrink(dish)
  const { cardProps, mediaStyle, turn, bursts, add, changeQuantity } = useDishCardMotion({
    dish,
    quantity,
    onAdd,
    onSetQuantity,
  })
  // A cup tips a little rather than spinning like a plate.
  const tip = useTransform(turn, (value) => value * 0.06)

  return (
    <motion.article
      {...cardProps}
      className={`group relative mt-32 flex flex-1 flex-col items-center rounded-[2rem] border border-white/15 bg-[#4A3024]/85 px-6 pb-6 sm:px-8 sm:pb-7 text-center text-[#F5E9DF] shadow-[0_24px_40px_-24px_rgba(60,30,15,0.75)] backdrop-blur-sm transition-colors duration-300 hover:bg-[#4A3024]/95 ${
        unavailable ? 'opacity-75' : ''
      }`}
    >
      {/* --- Cup --------------------------------------------------------- */}
      <motion.div style={mediaStyle} className="relative z-10 -mt-32 w-[80%]">
        {drink && (
          <>
            <FloatingBean className="animate-float-slow absolute bottom-[12%] -left-7 w-7 rotate-[-30deg] drop-shadow-[0_6px_6px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:-translate-x-2" />
            <FloatingBean className="animate-float-slower absolute top-[30%] -right-6 w-5 rotate-[40deg] drop-shadow-[0_6px_6px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:translate-x-2" />
          </>
        )}

        <motion.button
          type="button"
          onClick={() => onQuickView?.(dish)}
          aria-label={`View details for ${dish.name}`}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.96 }}
          style={{ rotate: tip }}
          className="relative block aspect-square w-full overflow-hidden rounded-[1.6rem] bg-[#6B4A3A] shadow-[0_22px_30px_-14px_rgba(40,20,10,0.85)] ring-1 ring-white/15 focus-visible:ring-4 focus-visible:ring-[#6FA3A0] focus-visible:outline-none"
        >
          <FullPhoto dish={dish} dimmed={unavailable} zoomOnHover />
          {unavailable && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-lg">
                Unavailable
              </span>
            </span>
          )}
        </motion.button>

        {(dish.isSpicy || dish.isChefPick) && (
          <div className="absolute -bottom-2 -left-2 z-20 flex gap-1.5">
            {dish.isChefPick && (
              <Marker
                icon={Star}
                label="Chef's pick"
                className="border-amber-300/40 bg-[#3A241A]/90 text-amber-300 [&_svg]:fill-current"
              />
            )}
            {dish.isSpicy && (
              <Marker
                icon={Flame}
                label="Spicy"
                className="border-red-400/40 bg-[#3A241A]/90 text-red-400"
              />
            )}
          </div>
        )}

        {onToggleFavorite && !admin && (
          <FavoriteButton
            dish={dish}
            isFavorite={isFavorite}
            isPending={isPending}
            onToggle={onToggleFavorite}
            theme="cafe"
            className="absolute -top-3 -right-3"
          />
        )}
      </motion.div>

      {/* --- Body -------------------------------------------------------- */}
      <div className="mt-5 flex w-full flex-1 flex-col items-center gap-2.5">
        {isNew(dish.createdAt) && (
          <span className="rounded-full bg-[#6FA3A0]/25 px-2.5 py-1 text-xs font-bold tracking-wider text-[#A9D3D0] uppercase">
            New
          </span>
        )}

        <h3 className="font-display text-2xl leading-snug font-bold text-[#F5E9DF] sm:text-[1.7rem]">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="line-clamp-2 max-w-md text-base leading-relaxed text-[#CDB8A8]">
            {dish.description}
          </p>
        )}

        <DrinkGuide strength={dish.coffeeStrength} milk={dish.milkLevel} />

        <div className="mt-auto flex w-full items-end justify-between gap-3 pt-4 text-left">
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-3xl font-bold text-[#F5E9DF]">
              {money(dish.price)}
            </span>
            {dish.prepTimeMinutes ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#B89E8C]">
                <Clock className="h-4 w-4" />
                {dish.prepTimeMinutes} min
              </span>
            ) : null}
          </div>

          {admin ? (
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  unavailable ? 'bg-red-500/20 text-red-200' : 'bg-[#6FA3A0]/25 text-[#A9D3D0]'
                }`}
              >
                {unavailable ? 'Unavailable' : 'Available'}
              </span>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(dish)}
                    aria-label={`Edit ${dish.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6FA3A0] text-white shadow-lg transition-colors hover:bg-[#5E918E]"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(dish)}
                    aria-label={`Delete ${dish.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#F5E9DF] ring-1 ring-white/15 transition-colors hover:bg-red-500/80"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <CartControl
              dish={dish}
              quantity={quantity}
              unavailable={unavailable}
              bursts={bursts}
              onAdd={add}
              onChange={changeQuantity}
              theme="cafe"
            />
          )}
        </div>
      </div>
    </motion.article>
  )
}
