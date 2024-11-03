/*
  Warnings:

  - You are about to drop the column `deliveryCharges` on the `BookingMaster` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Job_bookingMasterId_key";

-- AlterTable
ALTER TABLE "BookingMaster" DROP COLUMN "deliveryCharges",
ADD COLUMN     "dropoffDeliveryCharges" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "pickupDeliveryCharges" DOUBLE PRECISION DEFAULT 0;
