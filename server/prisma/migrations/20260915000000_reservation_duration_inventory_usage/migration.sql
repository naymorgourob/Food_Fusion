ALTER TABLE "reservations" ADD COLUMN "duration_minutes" INTEGER NOT NULL DEFAULT 120;

CREATE TABLE "inventory_usages" (
  "id" TEXT NOT NULL,
  "inventory_item_id" TEXT NOT NULL,
  "recorded_by_id" TEXT NOT NULL,
  "quantity_used" DECIMAL(10,2) NOT NULL,
  "remaining_quantity" DECIMAL(10,2) NOT NULL,
  "usage_date" DATE NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_usages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inventory_usages_inventory_item_id_usage_date_idx" ON "inventory_usages"("inventory_item_id", "usage_date");
CREATE INDEX "inventory_usages_recorded_by_id_idx" ON "inventory_usages"("recorded_by_id");
ALTER TABLE "inventory_usages" ADD CONSTRAINT "inventory_usages_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_usages" ADD CONSTRAINT "inventory_usages_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
