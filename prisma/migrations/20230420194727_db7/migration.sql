/*
  Warnings:

  - You are about to drop the column `catWashServiceId` on the `AllocatePrice` table. All the data in the column will be lost.
  - You are about to drop the column `laundryServiceDetailId` on the `AllocatePrice` table. All the data in the column will be lost.
  - You are about to drop the column `laundryServiceId` on the `AllocatePrice` table. All the data in the column will be lost.
  - You are about to drop the column `Route` on the `Routes` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Routes` table. All the data in the column will be lost.
  - You are about to drop the `CarWashService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LaundryService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LaundryServiceDetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `vendorServiceId` to the `AllocatePrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeName` to the `Routes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AllocatePrice" DROP CONSTRAINT "AllocatePrice_catWashServiceId_fkey";

-- DropForeignKey
ALTER TABLE "AllocatePrice" DROP CONSTRAINT "AllocatePrice_laundryServiceDetailId_fkey";

-- DropForeignKey
ALTER TABLE "AllocatePrice" DROP CONSTRAINT "AllocatePrice_laundryServiceId_fkey";

-- DropForeignKey
ALTER TABLE "LaundryServiceDetail" DROP CONSTRAINT "LaundryServiceDetail_laundryServiceId_fkey";

-- DropForeignKey
ALTER TABLE "Routes" DROP CONSTRAINT "Routes_roleId_fkey";

-- AlterTable
ALTER TABLE "AllocatePrice" DROP COLUMN "catWashServiceId",
DROP COLUMN "laundryServiceDetailId",
DROP COLUMN "laundryServiceId",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "vendorServiceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Routes" DROP COLUMN "Route",
DROP COLUMN "roleId",
ADD COLUMN     "routeName" TEXT NOT NULL;

-- DropTable
DROP TABLE "CarWashService";

-- DropTable
DROP TABLE "LaundryService";

-- DropTable
DROP TABLE "LaundryServiceDetail";

-- CreateTable
CREATE TABLE "RoleRouteMapping" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,

    CONSTRAINT "RoleRouteMapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_vendorServiceId_fkey" FOREIGN KEY ("vendorServiceId") REFERENCES "VendorService"("vendorServiceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleRouteMapping" ADD CONSTRAINT "RoleRouteMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleRouteMapping" ADD CONSTRAINT "RoleRouteMapping_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
