/*
  Warnings:

  - Added the required column `tapAuthId` to the `BookingMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'BOOKINGMASTER';

-- AlterTable
ALTER TABLE "BookingMaster" ADD COLUMN     "tapAuthId" TEXT NOT NULL;
