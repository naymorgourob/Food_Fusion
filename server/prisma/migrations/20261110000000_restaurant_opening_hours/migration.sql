-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "closed_on_date" TEXT,
ADD COLUMN     "closing_time" TEXT NOT NULL DEFAULT '23:00',
ADD COLUMN     "opening_time" TEXT NOT NULL DEFAULT '11:00';
