/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `DeliverySchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeliverySchedule_vendorId_key" ON "DeliverySchedule"("vendorId");
