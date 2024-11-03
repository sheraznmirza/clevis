-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'Rejected';

-- AddForeignKey
ALTER TABLE "BookingMaster" ADD CONSTRAINT "BookingMaster_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;
