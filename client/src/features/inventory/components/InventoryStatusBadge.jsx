import { INVENTORY_STATUS_CONFIG } from '@/features/inventory/inventoryHelpers'

export function InventoryStatusBadge({ status }) {
  const config = INVENTORY_STATUS_CONFIG[status] ?? INVENTORY_STATUS_CONFIG.IN_STOCK

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
          status === 'LOW_STOCK' || status === 'OUT_OF_STOCK' ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  )
}

