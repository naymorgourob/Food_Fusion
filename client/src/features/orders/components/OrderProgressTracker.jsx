import { Fragment } from 'react'
import { Check, X } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'

// The branch after READY depends on order type — a delivery order never
// passes through "Ready to Serve" and a dine-in/takeaway order never
// passes through "On the Way." Same rule order.service.js enforces
// server-side when staff changes status.
const FLOW_BY_TYPE = {
  DINE_IN: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  TAKEAWAY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'],
  DELIVERY: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'COMPLETED'],
}

export function OrderProgressTracker({ orderType, status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-danger text-white">
          <X className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-danger">This order was cancelled.</span>
      </div>
    )
  }

  const flow = FLOW_BY_TYPE[orderType]
  const currentIndex = flow.indexOf(status)

  return (
    <div className="flex items-start">
      {flow.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === flow.length - 1

        return (
          <Fragment key={step}>
            <div className="flex flex-col items-center gap-2 px-1">
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isComplete
                    ? 'bg-ember-600 text-white'
                    : isCurrent
                      ? 'bg-ember-600 text-white ring-4 ring-ember-100'
                      : 'bg-surface-2 text-ink-faint'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`w-16 text-center text-xs font-medium ${isCurrent || isComplete ? 'text-ink' : 'text-ink-faint'}`}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`mt-4 h-0.5 flex-1 transition-colors ${isComplete ? 'bg-ember-600' : 'bg-border'}`} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
