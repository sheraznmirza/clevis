-- AddForeignKey
ALTER TABLE "BookingMaster" ADD CONSTRAINT "BookingMaster_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
