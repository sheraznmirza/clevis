/*
  Warnings:

  - Added the required column `countryCode` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyName` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "currencyName" TEXT NOT NULL,
ADD COLUMN     "shortName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeliverySchedule" ALTER COLUMN "deliveryDurationMin" DROP NOT NULL;
