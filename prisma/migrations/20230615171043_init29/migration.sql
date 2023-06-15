/*
  Warnings:

  - The primary key for the `RiderJob` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "RiderJob" DROP CONSTRAINT "RiderJob_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RiderJob_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RiderJob_id_seq";
