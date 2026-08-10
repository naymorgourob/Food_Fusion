import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { DataTable } from '@/components/dashboard/DataTable'
import { LoyaltyCard } from '@/features/loyalty/components/LoyaltyCard'
import { useLoyalty } from '@/features/loyalty/hooks/useLoyalty'
import { fetchPointHistory } from '@/features/loyalty/services/loyaltyService'
import { ROUTES } from '@/constants'

const TYPE_STYLES = {
  EARNED: 'bg-success-soft text-success',
  BONUS: 'bg-ember-50 text-ember-600',
  REDEEMED: 'bg-surface-2 text-ink-muted',
}

const TYPE_LABELS = { EARNED: 'Earned', BONUS: 'Bonus', REDEEMED: 'Redeemed' }

// Customer-only page, no DashboardLayout — same shape as MyOrdersPage /
// MyBillsPage. History is fetched here rather than in a shared hook since
// this is its only consumer.
export default function LoyaltyPage() {
  const { summary, isLoading: summaryLoading } = useLoyalty()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchPointHistory()
        if (!cancelled) setTransactions(data)
      } catch {
        if (!cancelled) setTransactions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[row.type]}`}>
          {TYPE_LABELS[row.type]}
        </span>
      ),
    },
    {
      key: 'points',
      header: 'Points',
      // Sign is display-only — the ledger stores a positive magnitude and
      // lets `type` carry direction (see schema.prisma).
      render: (row) => (
        <span className={row.type === 'REDEEMED' ? 'text-ink-muted' : 'font-semibold text-success'}>
          {row.type === 'REDEEMED' ? '−' : '+'}
          {row.points}
        </span>
      ),
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'order',
      header: 'Related Order',
      render: (row) =>
        row.order ? (
          <Link to={`${ROUTES.ORDERS}/${row.order.id}`} className="text-ember-600 hover:text-ember-700">
            #{String(row.order.orderNumber).padStart(6, '0')}
          </Link>
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
    { key: 'createdAt', header: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link to={ROUTES.ACCOUNT} className="text-sm font-medium text-ink-muted hover:text-ink">
          Back to dashboard
        </Link>
      </div>

      <h1 className="text-h3 font-semibold text-ink">Loyalty &amp; Rewards</h1>

      <LoyaltyCard summary={summary} isLoading={summaryLoading} />

      <div className="flex flex-col gap-4">
        <h2 className="text-h4 font-semibold text-ink">Point History</h2>
        <DataTable
          columns={columns}
          rows={transactions}
          getRowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No point activity yet — complete an order to start earning."
        />
      </div>
    </div>
  )
}
