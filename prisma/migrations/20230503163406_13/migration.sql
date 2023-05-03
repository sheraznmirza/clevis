/*
  Warnings:

  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `State` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_cityId_fkey";

-- AlterTable
ALTER TABLE "City" DROP CONSTRAINT "City_pkey",
ALTER COLUMN "cityId" SET DATA TYPE TEXT,
ALTER COLUMN "stateId" SET DATA TYPE TEXT,
ADD CONSTRAINT "City_pkey" PRIMARY KEY ("cityId");

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("countryId");

-- AlterTable
ALTER TABLE "State" DROP CONSTRAINT "State_pkey",
ALTER COLUMN "stateId" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "State_pkey" PRIMARY KEY ("stateId");

-- AlterTable
ALTER TABLE "UserAddress" ALTER COLUMN "cityId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("cityId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("countryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("stateId") ON DELETE SET NULL ON UPDATE CASCADE;
