/*
  Warnings:

  - You are about to drop the `PasskeyProvider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user-passkey" DROP CONSTRAINT "user-passkey_passkeyProviderId_fkey";

-- DropTable
DROP TABLE "PasskeyProvider";

-- CreateTable
CREATE TABLE "user-passkey-provider" (
    "id" SERIAL NOT NULL,
    "aaguid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user-passkey-provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user-passkey-provider_aaguid_key" ON "user-passkey-provider"("aaguid");

-- AddForeignKey
ALTER TABLE "user-passkey" ADD CONSTRAINT "user-passkey_passkeyProviderId_fkey" FOREIGN KEY ("passkeyProviderId") REFERENCES "user-passkey-provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
