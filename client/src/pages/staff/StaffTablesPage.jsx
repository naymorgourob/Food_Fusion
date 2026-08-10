import { useOutletContext } from 'react-router-dom'
import { Users, Armchair, Info } from 'lucide-react'
import { EmptyState, SkeletonCard } from '@/components/customer/ui'

// Mirrors the TableStatus enum exactly — this is display styling, not a
// new set of states.
const STATUS_STYLE = {
  AVAILABLE: {
    label: 'Available',
    card: 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20',
    dot: 'bg-brand-500',
  },
  RESERVED: {
    label: 'Reserved',
    card: 'border-gold-300 bg-gold-100/50 dark:border-gold-700 dark:bg-gold-100/10',
    dot: 'bg-gold-500',
  },
  OCCUPIED: {
    label: 'Occupied',
    card: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-900/15',
    dot: 'bg-red-500',
  },
  INACTIVE: {
    label: 'Unavailable',
    card: 'border-rule bg-canvas-2 opacity-60',
    dot: 'bg-body-faint',
  },
}

/**
 * A visual floor layout (UI-07) — view-only.
 *
 * GET /tables is open to any authenticated role (Part 11 loosened it so
 * the reservation form could read table availability), but writes —
 * changing a table's status — are authorizeAdmin. So the spec's
 * "clickable table cards" that update status aren't offered here; a card
 * that opened an editor which then 403'd on save would be worse than a
 * plain, honest, read-only floor plan. Front-of-house staff still get the
 * thing they actually need at a glance: which tables are free right now.
 */
export default function StaffTablesPage() {
  const { tables } = useOutletContext()

  const sorted = [...tables.tables].sort((a, b) => a.number - b.number)
  const counts = sorted.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-body">Tables</h1>
        <p className="text-sm text-body-muted">{sorted.length} tables on the floor.</p>
      </div>

      {/* --- Legend / counts --------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-rule bg-card p-4">
        {Object.entries(STATUS_STYLE).map(([status, meta]) => (
          <span key={status} className="flex items-center gap-2 text-sm text-body-muted">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
            {meta.label}
            <span className="font-semibold text-body">{counts[status] ?? 0}</span>
          </span>
        ))}
      </div>

      <p className="flex items-start gap-2.5 rounded-xl border border-rule bg-canvas-2 px-4 py-3 text-sm text-body-muted">
        <Info className="mt-0.5 h-4 w-4 flex-none text-body-faint" />
        Table status is managed by the front desk. This view shows the current floor state.
      </p>

      {tables.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={Armchair} title="No tables configured" description="The floor plan will appear here once tables are added." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((table) => {
            const meta = STATUS_STYLE[table.status] ?? STATUS_STYLE.INACTIVE
            return (
              <div
                key={table.id}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${meta.card}`}
              >
                <span className="font-display text-xl font-semibold text-body">Table {table.number}</span>
                <span className="flex items-center gap-1.5 text-xs text-body-muted">
                  <Users className="h-3.5 w-3.5" />
                  Seats {table.capacity}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-body">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                {table.description && (
                  <span className="line-clamp-2 text-[0.7rem] text-body-faint">{table.description}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
