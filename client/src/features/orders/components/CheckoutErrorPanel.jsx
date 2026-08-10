import { AlertCircle, RotateCcw, CreditCard, LifeBuoy } from 'lucide-react'

/**
 * Checkout failure state (UI-04).
 *
 * The spec asked for a *failed payment* screen. No payment is processed at
 * checkout — there is no gateway, and BillPaymentStatus has no FAILED
 * value — so a payment failure is not a state this system can enter, and
 * showing one would be inventing an error that never happens.
 *
 * What genuinely can fail is order submission: a dish going unavailable
 * between browsing and confirming, a validation rejection, or the request
 * not reaching the server. This panel handles those, with the same three
 * escape routes the spec wanted — retry, change your choices, get help.
 */
export function CheckoutErrorPanel({ errors, onRetry, onChangePayment, isRetrying }) {
  if (!errors?.length) return null

  return (
    <section
      role="alert"
      aria-labelledby="checkout-error-heading"
      className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/20"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h3
            id="checkout-error-heading"
            className="font-display text-base font-semibold text-red-800 dark:text-red-200"
          >
            We couldn&rsquo;t place your order
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Nothing has been charged and your cart is untouched. Here&rsquo;s what went wrong:
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 rounded-xl bg-white/60 px-4 py-3 text-sm text-red-800 dark:bg-black/20 dark:text-red-200">
        {errors.map((message) => (
          <li key={message} className="flex items-start gap-2">
            <span aria-hidden className="mt-1.5 h-1 w-1 flex-none rounded-full bg-current" />
            {message}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          {isRetrying ? 'Retrying…' : 'Try again'}
        </button>

        <button
          type="button"
          onClick={onChangePayment}
          className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          <CreditCard className="h-4 w-4" />
          Change payment method
        </button>

        <a
          href="tel:+8801700000000"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          <LifeBuoy className="h-4 w-4" />
          Contact support
        </a>
      </div>
    </section>
  )
}
