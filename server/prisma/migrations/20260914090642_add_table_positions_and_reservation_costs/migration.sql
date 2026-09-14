-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "reservation_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "window_side_position" TEXT NOT NULL DEFAULT 'Interior';
