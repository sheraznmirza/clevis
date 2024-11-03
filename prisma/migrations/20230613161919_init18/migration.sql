/*
  Warnings:

  - A unique constraint covering the columns `[tapAuthId]` on the table `BookingMaster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobDate` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'VendorStatus';
ALTER TYPE "NotificationType" ADD VALUE 'UpdateByAdmin';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "jobDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vendorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserMaster" ADD COLUMN     "notificationEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "BookingMaster_tapAuthId_key" ON "BookingMaster"("tapAuthId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;
