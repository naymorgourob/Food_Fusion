-- CreateEnum
CREATE TYPE "ReservationOccasion" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'FAMILY_DINNER', 'BUSINESS_MEETING', 'DATE', 'OTHER');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'BONUS');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "occasion" "ReservationOccasion",
ADD COLUMN     "occasion_note" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "loyalty_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "points_redeemed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "first_order_bonus_points" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "loyalty_point_value" DECIMAL(6,3) NOT NULL DEFAULT 1,
ADD COLUMN     "loyalty_points_per_currency" DECIMAL(6,3) NOT NULL DEFAULT 0.1;

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" "LoyaltyTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_menu_items" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loyalty_transactions_customer_id_idx" ON "loyalty_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_order_id_idx" ON "loyalty_transactions"("order_id");

-- CreateIndex
CREATE INDEX "favorite_menu_items_customer_id_idx" ON "favorite_menu_items"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_menu_items_customer_id_menu_item_id_key" ON "favorite_menu_items"("customer_id", "menu_item_id");

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_menu_items" ADD CONSTRAINT "favorite_menu_items_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_menu_items" ADD CONSTRAINT "favorite_menu_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

