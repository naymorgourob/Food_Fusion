import { Receipt, CheckCircle2, Clock, Coins } from 'lucide-react'
import { money } from '@/utils/format'

export function BillingStatsSummary({
  bills = [],
  activeStatusFilter,
  onStatusFilterChange,
}) {
  const total = bills.length
  const paidBills = bills.filter((b) => b.paymentStatus === 'PAID')
  const unpaidBills = bills.filter((b) => b.paymentStatus === 'UNPAID')

  const paidTotalAmount = paidBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0)
  const unpaidTotalAmount = unpaidBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0)
  const cumulativeAmount = bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0)

  const cards = [
    {
      label: 'Total Invoices',
      value: total,
      sublabel: `${bills.length === 1 ? '1 bill' : `${bills.length} bills`} generated`,
      icon: Receipt,
      tone: 'brand',
      onClick: () => onStatusFilterChange(''),
      isActive: activeStatusFilter === '',
    },
    {
      label: 'Settled / Paid',
      value: money(paidTotalAmount),
      sublabel: `${paidBills.length} invoices cleared`,
      icon: CheckCircle2,
      tone: 'success',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'PAID' ? '' : 'PAID'),
      isActive: activeStatusFilter === 'PAID',
    },
    {
      label: 'Pending Collection',
      value: money(unpaidTotalAmount),
      sublabel: `${unpaidBills.length} unpaid invoices`,
      icon: Clock,
      tone: 'warning',
      onClick: () => onStatusFilterChange(activeStatusFilter === 'UNPAID' ? '' : 'UNPAID'),
      isActive: activeStatusFilter === 'UNPAID',
    },
    {
      label: 'Gross Billed',
      value: money(cumulativeAmount),
      sublabel: 'All-time invoice total',
      icon: Coins,
      tone: 'gold',
      onClick: null,
      isActive: false,
    },
  ]

  const toneStyles = {
    brand:
      'border-brand-200 bg-brand-50/50 text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300',
    success:
      'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300',
    warning:
      'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300',
    gold:
      'border-gold-200 bg-gold-50/50 text-gold-700 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-300',
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isClickable = Boolean(card.onClick)
        const Component = isClickable ? 'button' : 'div'

        return (
          <Component
            key={card.label}
            type={isClickable ? 'button' : undefined}
            onClick={card.onClick}
            className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
              card.isActive
                ? `${toneStyles[card.tone]} ring-2 ring-brand-500/20 shadow-sm`
                : 'border-rule bg-card hover:border-brand-200'
            } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-muted">{card.label}</span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl ${toneStyles[card.tone]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-body leading-none">
                {card.value}
              </span>
              <span className="mt-1 text-[11px] text-body-faint">{card.sublabel}</span>
            </div>
          </Component>
        )
      })}
    </div>
  )
}

