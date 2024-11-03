/*
  Warnings:

  - The `status` column on the `RiderJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "RiderJobStatus" ADD VALUE 'Rejected';

-- AlterTable
ALTER TABLE "RiderJob" DROP COLUMN "status",
ADD COLUMN     "status" "RiderJobStatus" NOT NULL DEFAULT 'Pending';
