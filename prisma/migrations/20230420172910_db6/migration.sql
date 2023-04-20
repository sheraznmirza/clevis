/*
  Warnings:

  - You are about to drop the column `userUserId` on the `UserAddress` table. All the data in the column will be lost.
  - You are about to drop the column `serviceImage` on the `VendorService` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userType` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `UserMaster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userMasterId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_userUserId_fkey";

-- DropIndex
DROP INDEX "Otp_otp_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "userType" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "userUserId",
ADD COLUMN     "adminId" INTEGER;

-- AlterTable
ALTER TABLE "UserMaster" ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VendorService" DROP COLUMN "serviceImage",
ADD COLUMN     "serviceImages" INTEGER[];

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarWashService" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "CarWashService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryService" (
    "id" SERIAL NOT NULL,
    "laundryServiceDetailId" INTEGER NOT NULL,

    CONSTRAINT "LaundryService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryServiceDetail" (
    "id" SERIAL NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "laundryServiceId" INTEGER,

    CONSTRAINT "LaundryServiceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocatePrice" (
    "id" SERIAL NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "catWashServiceId" INTEGER,
    "laundryServiceId" INTEGER,
    "laundryServiceDetailId" INTEGER,

    CONSTRAINT "AllocatePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userMasterId_key" ON "Admin"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryService_laundryServiceDetailId_key" ON "LaundryService"("laundryServiceDetailId");

-- AddForeignKey
ALTER TABLE "UserMaster" ADD CONSTRAINT "UserMaster_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "UserMaster"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryServiceDetail" ADD CONSTRAINT "LaundryServiceDetail_laundryServiceId_fkey" FOREIGN KEY ("laundryServiceId") REFERENCES "LaundryService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "SubCategory"("subCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_catWashServiceId_fkey" FOREIGN KEY ("catWashServiceId") REFERENCES "CarWashService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_laundryServiceId_fkey" FOREIGN KEY ("laundryServiceId") REFERENCES "LaundryService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_laundryServiceDetailId_fkey" FOREIGN KEY ("laundryServiceDetailId") REFERENCES "LaundryServiceDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
