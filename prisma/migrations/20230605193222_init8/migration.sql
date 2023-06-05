/*
  Warnings:

  - You are about to drop the column `fromUser` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `seen` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `toUser` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `body` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notificationType` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userMasterId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('WEB', 'ANDROID', 'IOS');

-- CreateEnum
CREATE TYPE "NotificationReadStatus" AS ENUM ('UNREAD', 'READ');

-- CreateEnum
CREATE TYPE "NotificationVisiblityStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('VENDOR', 'RIDER', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_fromUser_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_toUser_fkey";

-- AlterTable
ALTER TABLE "BookingMaster" ADD COLUMN     "carNumberPlate" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "fromUser",
DROP COLUMN "message",
DROP COLUMN "seen",
DROP COLUMN "toUser",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "entityId" INTEGER,
ADD COLUMN     "entityType" "EntityType",
ADD COLUMN     "notificationType" "NotificationType" NOT NULL,
ADD COLUMN     "readStatus" "NotificationReadStatus" NOT NULL DEFAULT 'UNREAD',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userMasterId" INTEGER NOT NULL,
ADD COLUMN     "visibilityStatus" "NotificationVisiblityStatus" NOT NULL DEFAULT 'VISIBLE',
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "UpdateApproval" (
    "id" SERIAL NOT NULL,
    "companyEmail" TEXT,
    "businessLicenseIds" TEXT,
    "vendorId" INTEGER,
    "riderId" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "UpdateApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "playerId" TEXT,
    "type" "DeviceType" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCards" (
    "customerCardId" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "tapCardId" INTEGER NOT NULL,
    "cardNumber" TEXT,
    "fingerprint3D" TEXT,
    "firstSixDigit" TEXT,
    "lastFourDigit" TEXT,
    "bankName" TEXT,
    "bankId" TEXT,
    "brand" TEXT,
    "funding" TEXT,
    "schee" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerCards_pkey" PRIMARY KEY ("customerCardId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCards_tapCardId_key" ON "CustomerCards"("tapCardId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateApproval" ADD CONSTRAINT "UpdateApproval_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateApproval" ADD CONSTRAINT "UpdateApproval_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("riderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCards" ADD CONSTRAINT "CustomerCards_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
