/**
 * Shared field styling for the checkout detail steps (UI-04).
 *
 * These three components (dine-in / delivery / takeaway) previously used
 * the old ink/ember tokens, which made them look like a different product
 * once they were rendered inside the redesigned emerald checkout. Pulling
 * the classes here keeps the three visually identical to each other and
 * to the rest of the flow.
 */
export const FIELD =
  'w-full rounded-xl border border-rule bg-card px-3.5 py-2.5 text-sm text-body placeholder:text-body-faint focus:border-brand-400 focus:ring-3 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900'

export const LABEL = 'text-sm font-medium text-body'

export const OPTIONAL = 'font-normal text-body-faint'

/** Informational note (e.g. the suggested kitchen-ready time). */
export const NOTE =
  'rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs leading-relaxed text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100'
