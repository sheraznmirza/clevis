/*
  Warnings:

  - A unique constraint covering the columns `[logoId]` on the table `Rider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BusinessLicense" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceImage" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkspaceImages" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Rider_logoId_key" ON "Rider"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_logoId_key" ON "Vendor"("logoId");
