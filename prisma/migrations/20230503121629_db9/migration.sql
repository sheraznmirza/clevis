/*
  Warnings:

  - You are about to drop the column `serviceType` on the `Rider` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRt` on the `UserMaster` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `UserMaster` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VendorCreated', 'RiderCreated');

-- AlterTable
ALTER TABLE "Rider" DROP COLUMN "serviceType";

-- AlterTable
ALTER TABLE "UserMaster" DROP COLUMN "hashedRt",
DROP COLUMN "profileImage",
ADD COLUMN     "profileImageId" INTEGER;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "toUser" INTEGER NOT NULL,
    "fromUser" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserMaster" ADD CONSTRAINT "UserMaster_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_toUser_fkey" FOREIGN KEY ("toUser") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fromUser_fkey" FOREIGN KEY ("fromUser") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;
