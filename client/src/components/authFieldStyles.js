/**
 * Shared field styling for auth and profile forms (UI-09) — the same
 * pattern as features/orders/components/fieldStyles.js from the checkout
 * redesign, so every form on the site (ordering, checkout, reservations,
 * auth, profile) ends up visually identical without a shared component
 * tree forcing it.
 */
export const FIELD =
  'w-full rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body placeholder:text-body-faint transition-colors focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900'

export const FIELD_ERROR =
  'w-full rounded-xl border border-red-300 bg-card px-3.5 py-2.5 text-sm text-body placeholder:text-body-faint focus:border-red-400 focus:ring-3 focus:ring-red-100 focus:outline-none dark:border-red-800 dark:focus:ring-red-900'

export const DISABLED_FIELD =
  'w-full cursor-not-allowed rounded-xl border border-rule bg-canvas-2 px-3.5 py-2.5 text-sm text-body-faint'

export const LABEL = 'text-sm font-medium text-body'

export const OPTIONAL = 'font-normal text-body-faint'
