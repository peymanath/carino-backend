/*
  Warnings:

  - You are about to drop the `PermissionToCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PermissionToCategory" DROP CONSTRAINT "PermissionToCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionToCategory" DROP CONSTRAINT "PermissionToCategory_permissionId_fkey";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "PermissionToCategory";

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PermissionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
