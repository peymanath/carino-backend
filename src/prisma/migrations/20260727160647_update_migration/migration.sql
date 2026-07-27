/*
  Warnings:

  - You are about to drop the `_UserPermissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserPermissions" DROP CONSTRAINT "_UserPermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserPermissions" DROP CONSTRAINT "_UserPermissions_B_fkey";

-- DropTable
DROP TABLE "_UserPermissions";

-- CreateTable
CREATE TABLE "_user_permissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_user_permissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_user_permissions_B_index" ON "_user_permissions"("B");

-- AddForeignKey
ALTER TABLE "_user_permissions" ADD CONSTRAINT "_user_permissions_A_fkey" FOREIGN KEY ("A") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_permissions" ADD CONSTRAINT "_user_permissions_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
