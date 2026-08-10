-- CreateEnum
CREATE TYPE "InventoryUnit" AS ENUM ('KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" "InventoryUnit" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "min_stock_level" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

