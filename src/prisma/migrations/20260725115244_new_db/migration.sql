/*
  Warnings:

  - You are about to drop the `BomberJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_passkey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_passkey_provider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_passkey" DROP CONSTRAINT "user_passkey_providerId_fkey";

-- DropForeignKey
ALTER TABLE "user_passkey" DROP CONSTRAINT "user_passkey_userId_fkey";

-- DropTable
DROP TABLE "BomberJob";

-- DropTable
DROP TABLE "user_passkey";

-- DropTable
DROP TABLE "user_passkey_provider";
