/*
  Warnings:

  - A unique constraint covering the columns `[profilePictureId]` on the table `UserMaster` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMaster_profilePictureId_key" ON "UserMaster"("profilePictureId");
