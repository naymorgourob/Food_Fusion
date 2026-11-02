import { useEffect, useState } from 'react'
import { Wallet, Receipt } from 'lucide-react'
import { fetchMyPayslips } from '@/features/payroll/services/payrollService'
import { money } from '@/utils/format'

const METHOD_LABEL = {
  BANK: 'Bank transfer',
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  ROCKET: 'Rocket',
  CASH: 'Cash',
}

function monthLabel(period) {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
}

/** A staff member's own salary and payment history (read-only). */
export default function MyPayslipsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyPayslips()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message ?? 'Could not load your payslips.'))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-body">My Payslips</h1>
        <p className="text-base text-body-muted">
          Your salary and every payment the restaurant has recorded.
        </p>
      </div>

      {error && <p className="text-rose-500">{error}</p>}

      <div className="flex items-center gap-4 rounded-2xl border border-rule bg-card p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/20 text-gold-700 dark:text-gold-300">
          <Wallet className="h-6 w-6" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-body-muted">Monthly salary</span>
          <span className="font-display text-2xl font-bold text-body">
            {data?.monthlySalary != null ? money(Number(data.monthlySalary)) : 'Not set yet'}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-rule bg-card">
        {!data && !error && <p className="p-6 text-body-muted">Loading…</p>}
        {data?.payments.length === 0 && (
          <p className="flex items-center gap-2 p-6 text-body-muted">
            <Receipt className="h-5 w-5" /> No salary payments recorded yet.
          </p>
        )}
        {data?.payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4 last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="text-base font-semibold text-body">
                {monthLabel(payment.period)}
              </span>
              <span className="text-sm text-body-faint">
                Paid {new Date(payment.paidAt).toLocaleDateString()} ·{' '}
                {METHOD_LABEL[payment.method]}
                {payment.reference ? ` · ${payment.reference}` : ''}
                {payment.note ? ` · ${payment.note}` : ''}
              </span>
            </div>
            <span className="font-display text-xl font-bold text-body">
              {money(Number(payment.amount))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
