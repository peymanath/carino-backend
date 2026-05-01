/*
  Warnings:

  - You are about to drop the column `mediaId` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "mediaId";
