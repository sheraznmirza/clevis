/*
  Warnings:

  - You are about to drop the column `logo` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `logoId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "logo",
ADD COLUMN     "logoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
