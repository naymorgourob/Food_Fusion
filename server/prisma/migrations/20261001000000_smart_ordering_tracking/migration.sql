-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'DELIVERY', 'TAKEAWAY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "OrderStatus" ADD VALUE 'ON_THE_WAY';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "assigned_staff_id" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "delivery_charge" DECIMAL(10,2),
ADD COLUMN     "delivery_phone" TEXT,
ADD COLUMN     "estimated_delivery_time" TIMESTAMP(3),
ADD COLUMN     "estimated_ready_time" TIMESTAMP(3),
ADD COLUMN     "guest_count" INTEGER,
ADD COLUMN     "on_the_way_at" TIMESTAMP(3),
ADD COLUMN     "order_type" "OrderType" NOT NULL,
ADD COLUMN     "preparing_at" TIMESTAMP(3),
ADD COLUMN     "ready_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_arrival_time" TIMESTAMP(3),
ADD COLUMN     "scheduled_pickup_time" TIMESTAMP(3),
ADD COLUMN     "served_at" TIMESTAMP(3),
ADD COLUMN     "special_instructions" TEXT;

-- CreateIndex
CREATE INDEX "orders_assigned_staff_id_idx" ON "orders"("assigned_staff_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

