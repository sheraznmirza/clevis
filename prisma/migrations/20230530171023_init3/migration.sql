/*
  Warnings:

  - You are about to drop the column `total` on the `BookingMaster` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `BookingMaster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_fromUser_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_toUser_fkey";

-- AlterTable
ALTER TABLE "BookingMaster" DROP COLUMN "total",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "updatedAt",
ALTER COLUMN "toUser" DROP NOT NULL,
ALTER COLUMN "fromUser" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DeliverySchedule" (
    "deliveryScheduleId" SERIAL NOT NULL,
    "deliveryDurationMin" INTEGER NOT NULL DEFAULT 24,
    "deliveryDurationMax" INTEGER DEFAULT 48,
    "serviceDurationMin" INTEGER DEFAULT 24,
    "serviceDurationMax" INTEGER DEFAULT 48,
    "deliveryItemMin" INTEGER DEFAULT 1,
    "deliveryItemMax" INTEGER DEFAULT 20,
    "kilometerFare" DOUBLE PRECISION DEFAULT 0,
    "vendorId" INTEGER NOT NULL,

    CONSTRAINT "DeliverySchedule_pkey" PRIMARY KEY ("deliveryScheduleId")
);

-- CreateTable
CREATE TABLE "BookingDetail" (
    "bookingDetailId" SERIAL NOT NULL,
    "allocatePriceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "bookingMasterId" INTEGER NOT NULL,

    CONSTRAINT "BookingDetail_pkey" PRIMARY KEY ("bookingDetailId")
);

-- CreateTable
CREATE TABLE "BookingAttachments" (
    "id" SERIAL NOT NULL,
    "bookingMasterId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BookingAttachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_toUser_fkey" FOREIGN KEY ("toUser") REFERENCES "UserMaster"("userMasterId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fromUser_fkey" FOREIGN KEY ("fromUser") REFERENCES "UserMaster"("userMasterId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySchedule" ADD CONSTRAINT "DeliverySchedule_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDetail" ADD CONSTRAINT "BookingDetail_allocatePriceId_fkey" FOREIGN KEY ("allocatePriceId") REFERENCES "AllocatePrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDetail" ADD CONSTRAINT "BookingDetail_bookingMasterId_fkey" FOREIGN KEY ("bookingMasterId") REFERENCES "BookingMaster"("bookingMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAttachments" ADD CONSTRAINT "BookingAttachments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAttachments" ADD CONSTRAINT "BookingAttachments_bookingMasterId_fkey" FOREIGN KEY ("bookingMasterId") REFERENCES "BookingMaster"("bookingMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;
