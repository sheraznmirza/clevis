/*
  Warnings:

  - The `jobStatus` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "jobStatus",
ADD COLUMN     "jobStatus" "RiderJobStatus" NOT NULL DEFAULT 'Pending';
