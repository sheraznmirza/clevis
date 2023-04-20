/*
  Warnings:

  - Made the column `categoryId` on table `AllocatePrice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AllocatePrice" DROP CONSTRAINT "AllocatePrice_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "AllocatePrice" DROP CONSTRAINT "AllocatePrice_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "AllocatePrice" ALTER COLUMN "subcategoryId" DROP NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocatePrice" ADD CONSTRAINT "AllocatePrice_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "SubCategory"("subCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;
