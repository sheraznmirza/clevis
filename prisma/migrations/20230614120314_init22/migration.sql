-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Completed', 'Pending', 'Accepted');

-- AlterTable
ALTER TABLE "BookingMaster" ADD COLUMN     "completionTime" TIMESTAMP(3),
ADD COLUMN     "confirmationTime" TIMESTAMP(3);
