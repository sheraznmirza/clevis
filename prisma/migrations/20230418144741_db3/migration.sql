/*
  Warnings:

  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `workspaceImages` column on the `Rider` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `businessLicense` column on the `Rider` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `State` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `profileImage` column on the `UserMaster` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workspaceImages` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `businessLicense` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `encoding` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `logo` on the `Rider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `logo` on the `Vendor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_cityId_fkey";

-- AlterTable
ALTER TABLE "City" DROP CONSTRAINT "City_pkey",
ADD COLUMN     "cId" SERIAL NOT NULL,
ADD CONSTRAINT "City_pkey" PRIMARY KEY ("cId");

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
ADD COLUMN     "coId" SERIAL NOT NULL,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("coId");

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "encoding" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Rider" DROP COLUMN "logo",
ADD COLUMN     "logo" INTEGER NOT NULL,
DROP COLUMN "workspaceImages",
ADD COLUMN     "workspaceImages" INTEGER[],
DROP COLUMN "businessLicense",
ADD COLUMN     "businessLicense" INTEGER[];

-- AlterTable
ALTER TABLE "State" DROP CONSTRAINT "State_pkey",
ADD COLUMN     "sId" SERIAL NOT NULL,
ADD CONSTRAINT "State_pkey" PRIMARY KEY ("sId");

-- AlterTable
ALTER TABLE "UserMaster" DROP COLUMN "profileImage",
ADD COLUMN     "profileImage" INTEGER;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "logo",
ADD COLUMN     "logo" INTEGER NOT NULL,
DROP COLUMN "workspaceImages",
ADD COLUMN     "workspaceImages" INTEGER[],
DROP COLUMN "businessLicense",
ADD COLUMN     "businessLicense" INTEGER[];

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("cId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("coId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("sId") ON DELETE SET NULL ON UPDATE CASCADE;
