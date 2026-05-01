/*
  Warnings:

  - You are about to drop the column `aaguid` on the `user_passkey` table. All the data in the column will be lost.
  - You are about to drop the column `passkeyProviderId` on the `user_passkey` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `user_passkey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_passkey" DROP CONSTRAINT "user_passkey_passkeyProviderId_fkey";

-- AlterTable
ALTER TABLE "user_passkey" DROP COLUMN "aaguid",
DROP COLUMN "passkeyProviderId",
ADD COLUMN     "providerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "user_passkey" ADD CONSTRAINT "user_passkey_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user_passkey_provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
