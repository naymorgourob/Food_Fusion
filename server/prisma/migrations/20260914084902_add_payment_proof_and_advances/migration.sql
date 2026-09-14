-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "advance_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_proof_image" TEXT,
ADD COLUMN     "payment_reference" TEXT,
ADD COLUMN     "payment_submitted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "advance_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_proof_image" TEXT,
ADD COLUMN     "payment_reference" TEXT,
ADD COLUMN     "payment_submitted_at" TIMESTAMP(3),
ADD COLUMN     "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
