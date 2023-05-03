/*
  Warnings:

  - You are about to drop the column `profileImageId` on the `UserMaster` table. All the data in the column will be lost.
  - You are about to drop the column `logoId` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `logo` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserMaster" DROP CONSTRAINT "UserMaster_profileImageId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_logoId_fkey";

-- AlterTable
ALTER TABLE "UserMaster" DROP COLUMN "profileImageId",
ADD COLUMN     "profileImage" INTEGER,
ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "logoId",
ADD COLUMN     "logo" INTEGER NOT NULL;
