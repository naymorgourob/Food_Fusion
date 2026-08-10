-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "restaurant_name" TEXT NOT NULL DEFAULT 'FoodFusion',
    "restaurant_address" TEXT NOT NULL DEFAULT '',
    "restaurant_phone" TEXT NOT NULL DEFAULT '',
    "restaurant_email" TEXT NOT NULL DEFAULT '',
    "vat_percentage" DECIMAL(5,2) NOT NULL DEFAULT 13,
    "currency_symbol" TEXT NOT NULL DEFAULT '$',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

