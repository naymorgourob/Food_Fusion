-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" TEXT;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "payment_method" TEXT;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "bank_account" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "bkash_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nagad_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rocket_number" TEXT NOT NULL DEFAULT '';

