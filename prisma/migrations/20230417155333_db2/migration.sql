/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `SubCategory` table. All the data in the column will be lost.
  - Added the required column `serviceType` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `SubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('FILE', 'IMAGE', 'VIDEO', 'AUDIO');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "serviceId",
ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "categoryId",
ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_path_key" ON "Media"("path");
