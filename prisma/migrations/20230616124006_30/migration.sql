/*
  Warnings:

  - You are about to drop the column `status` on the `Earnings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Earnings" DROP COLUMN "status",
ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "bookingMasterId" INTEGER,
ADD COLUMN     "isRefunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobId" INTEGER,
ADD COLUMN     "tapAuthId" TEXT,
ADD COLUMN     "tapChargeId" TEXT,
ADD COLUMN     "tapCustomerId" TEXT,
ADD COLUMN     "tapMerchantId" TEXT,
ALTER COLUMN "jobType" DROP NOT NULL,
ALTER COLUMN "serviceType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_bookingMasterId_fkey" FOREIGN KEY ("bookingMasterId") REFERENCES "BookingMaster"("bookingMasterId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
