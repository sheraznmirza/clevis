-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL_PAID', 'FULLY_PAID');

-- AlterTable
ALTER TABLE "BookingMaster" ADD COLUMN     "tapPaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "Rider" ADD COLUMN     "tapBranchId" TEXT,
ADD COLUMN     "tapBrandId" TEXT,
ADD COLUMN     "tapBusinessEntityId" TEXT,
ADD COLUMN     "tapBusinessId" TEXT,
ADD COLUMN     "tapMerchantId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "tapBranchId" TEXT,
ADD COLUMN     "tapBrandId" TEXT,
ADD COLUMN     "tapBusinessEntityId" TEXT,
ADD COLUMN     "tapBusinessId" TEXT,
ADD COLUMN     "tapMerchantId" TEXT,
ADD COLUMN     "tapPrimaryWalletId" TEXT,
ADD COLUMN     "tapWalletId" TEXT;
