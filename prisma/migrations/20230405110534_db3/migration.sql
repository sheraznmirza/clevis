/*
  Warnings:

  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_cityId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_cityId_fkey";

-- DropTable
DROP TABLE "City";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "Services";

-- DropTable
DROP TABLE "State";

-- DropTable
DROP TABLE "UserAddress";

-- DropTable
DROP TABLE "Users";

-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "users" (
    "userMasterId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userMasterId")
);

-- CreateTable
CREATE TABLE "customers" (
    "customerId" SERIAL NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullname" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'CUSTOMER',

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "vendors" (
    "vendorId" SERIAL NOT NULL,
    "userMasterId" INTEGER NOT NULL,
    "fullname" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'VENDOR',
    "serviceType" "ServiceType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "workspaceImages" TEXT[],
    "businessLicense" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendorId")
);

-- CreateTable
CREATE TABLE "addresses" (
    "userAddressId" BIGSERIAL NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "vendorId" INTEGER,
    "customerId" INTEGER,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("userAddressId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userMasterId_key" ON "customers"("userMasterId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userMasterId_key" ON "vendors"("userMasterId");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "users"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userMasterId_fkey" FOREIGN KEY ("userMasterId") REFERENCES "users"("userMasterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("vendorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
