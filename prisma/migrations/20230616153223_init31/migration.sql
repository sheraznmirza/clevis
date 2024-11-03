/*
  Warnings:

  - You are about to drop the column `jobType` on the `Earnings` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `Earnings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Earnings" DROP COLUMN "jobType",
DROP COLUMN "serviceType";
