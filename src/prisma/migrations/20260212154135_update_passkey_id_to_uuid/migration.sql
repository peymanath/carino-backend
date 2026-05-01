/*
  Warnings:

  - The primary key for the `user_passkey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `user_passkey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_passkey" DROP CONSTRAINT "user_passkey_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "user_passkey_pkey" PRIMARY KEY ("id");
