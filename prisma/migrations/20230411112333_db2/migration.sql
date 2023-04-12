-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "isApproved" "Status" NOT NULL DEFAULT 'PENDING';
