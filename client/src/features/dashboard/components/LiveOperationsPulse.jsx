import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Boxes,
  ArrowRight,
  Utensils,
  ChevronRight,
} from 'lucide-react'

export function LiveOperationsPulse({
  pendingOrdersCount = 0,
  prepOrdersCount = 0,
  readyOrdersCount = 0,
  tables = [],
  inventoryItems = [],
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-rule bg-card p-5 shadow-xs"
          >
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  // Table calculations
  const totalTables = tables.length
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length
  const reservedTables = tables.filter((t) => t.status === 'RESERVED').length
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length
  const occupancyPercent = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0

  // Inventory warnings
  const lowStockItems = inventoryItems.filter(
    (item) =>
      item.status === 'LOW_STOCK' ||
      item.status === 'OUT_OF_STOCK' ||
      Number(item.quantity) <= Number(item.minStockLevel)
  )

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* ── 1. Kitchen Queue Pipeline ─────────────────────────── */}
      <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-body">Kitchen Order Queue</h3>
          </div>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Manage <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="my-3 grid grid-cols-3 gap-2">
          {/* Pending */}
          <Link
            to="/dashboard/orders?status=PENDING"
            className="flex flex-col items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50/40 p-2.5 text-center transition-all hover:bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20"
          >
            <span className="font-mono text-xl font-bold text-amber-700 dark:text-amber-400">
              {pendingOrdersCount}
            </span>
            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
              Pending
            </span>
          </Link>

          {/* Cooking / Preparing */}
          <Link
            to="/dashboard/orders?status=PREPARING"
            className="flex flex-col items-center justify-center rounded-xl border border-orange-200/60 bg-orange-50/40 p-2.5 text-center transition-all hover:bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
          >
            <span className="font-mono text-xl font-bold text-orange-700 dark:text-orange-400">
              {prepOrdersCount}
            </span>
            <span className="text-[10px] font-semibold text-orange-800 dark:text-orange-300">
              Cooking
            </span>
          </Link>

          {/* Ready / Serving */}
          <Link
            to="/dashboard/orders?status=READY"
            className="flex flex-col items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-2.5 text-center transition-all hover:bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
          >
            <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {readyOrdersCount}
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
              Ready
            </span>
          </Link>
        </div>

        <p className="text-[11px] text-body-muted">
          {pendingOrdersCount + prepOrdersCount + readyOrdersCount === 0
            ? 'Kitchen queue is currently clear.'
            : `${pendingOrdersCount + prepOrdersCount + readyOrdersCount} orders currently moving through the kitchen line.`}
        </p>
      </div>

      {/* ── 2. Dining Floor & Table Occupancy ─────────────────── */}
      <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-body">Dining Floor Occupancy</h3>
          </div>
          <Link
            to="/dashboard/tables"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Floor Plan <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="my-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-body">
            <span>
              {availableTables} of {totalTables} tables free
            </span>
            <span className="font-mono text-sky-600 dark:text-sky-400">
              {occupancyPercent}% seated
            </span>
          </div>

          {/* Occupancy progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-canvas-2 border border-rule/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-brand-500 transition-all duration-500"
              style={{ width: `${Math.max(4, occupancyPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-body-muted pt-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {availableTables} Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {reservedTables} Reserved
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {occupiedTables} Seated
            </span>
          </div>
        </div>

        <p className="text-[11px] text-body-muted">
          {availableTables > 0
            ? 'Capacity available for walk-in and reservation seatings.'
            : 'Dining floor is currently at peak capacity.'}
        </p>
      </div>

      {/* ── 3. Kitchen Inventory & Restock Alerts ──────────────── */}
      <div className="flex flex-col justify-between rounded-2xl border border-rule bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:bg-gold-500/20 dark:text-gold-400">
              <Boxes className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-body">Inventory Restock Health</h3>
          </div>
          <Link
            to="/dashboard/inventory"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Inventory <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="my-3 flex items-center gap-3">
          {lowStockItems.length > 0 ? (
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5 flex-none text-rose-600 dark:text-rose-400" />
              <div className="flex flex-col">
                <span className="font-bold">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} below restock threshold
                </span>
                <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80 truncate max-w-[200px]">
                  Needs restock: {lowStockItems.map((i) => i.itemName).join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-bold">All stock levels healthy</span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  {inventoryItems.length} ingredients tracked above safety limits.
                </span>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/dashboard/inventory"
          className="inline-flex items-center justify-between rounded-xl border border-rule bg-canvas px-3 py-2 text-xs font-semibold text-body hover:bg-canvas-2 transition-colors"
        >
          <span>Audit Supply Pantry</span>
          <ArrowRight className="h-3.5 w-3.5 text-body-muted" />
        </Link>
      </div>
    </div>
  )
}

