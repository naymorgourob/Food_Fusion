import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, CircleSlash, ArrowRight, RefreshCw } from 'lucide-react'
import { startAdvancePayment } from '@/features/payments/services/paymentService'
import { money } from '@/utils/format'

const OUTCOMES = {
  success: {
    icon: CheckCircle2,
    tone: 'text-emerald-500',
    title: 'Advance paid — thank you!',
    body: 'Your payment was verified with SSLCommerz, and the restaurant now sees your advance as paid.',
  },
  failed: {
    icon: XCircle,
    tone: 'text-red-500',
    title: 'The payment didn’t go through',
    body: 'No money was taken. Your booking is saved — you can try paying again.',
  },
  cancelled: {
    icon: CircleSlash,
    tone: 'text-amber-500',
    title: 'Payment cancelled',
    body: 'You left the payment page. Your booking is saved and waiting for the advance.',
  },
}

/**
 * Where SSLCommerz sends the customer back to (via the API's callback,
 * which has already verified the payment). Unpaid bookings can retry.
 */
export default function PaymentResultPage() {
  const [params] = useSearchParams()
  const status = OUTCOMES[params.get('status')] ? params.get('status') : 'failed'
  const type = params.get('type')
  const id = params.get('id')
  const amount = params.get('amount')
  const outcome = OUTCOMES[status]
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')

  const destination =
    type === 'order'
      ? { to: `/orders/${id}`, label: 'Track your order' }
      : { to: '/reservations', label: 'View your reservations' }

  async function retry() {
    setRetrying(true)
    setError('')
    try {
      const { gatewayUrl } = await startAdvancePayment(type, id)
      window.location.assign(gatewayUrl)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not open the payment page. Please try again.')
      setRetrying(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col items-center gap-5 rounded-3xl border border-rule bg-card p-10 text-center"
      >
        <outcome.icon className={`h-16 w-16 ${outcome.tone}`} strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-semibold text-body">{outcome.title}</h1>
        <p className="text-body-muted">{outcome.body}</p>
        {amount && (
          <p className="rounded-full bg-canvas-2 px-4 py-1.5 text-sm font-semibold text-body">
            {status === 'success' ? 'Paid' : 'Advance due'}: {money(Number(amount))}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {status !== 'success' && type && id && (
            <button
              type="button"
              onClick={retry}
              disabled={retrying}
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-semibold text-charcoal transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Opening payment…' : 'Try paying again'}
            </button>
          )}
          {type && id && (
            <Link
              to={destination.to}
              className="inline-flex items-center gap-2 rounded-full border border-rule px-6 py-3 font-semibold text-body transition-colors hover:bg-canvas-2"
            >
              {destination.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
