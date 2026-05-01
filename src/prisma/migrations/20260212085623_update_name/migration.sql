/*
  Warnings:

  - You are about to drop the `user-passkey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user-passkey-provider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user-passkey" DROP CONSTRAINT "user-passkey_passkeyProviderId_fkey";

-- DropForeignKey
ALTER TABLE "user-passkey" DROP CONSTRAINT "user-passkey_userId_fkey";

-- DropTable
DROP TABLE "user-passkey";

-- DropTable
DROP TABLE "user-passkey-provider";

-- CreateTable
CREATE TABLE "user_passkey" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "aaguid" TEXT,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "passkeyProviderId" INTEGER,

    CONSTRAINT "user_passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passkey_provider" (
    "id" SERIAL NOT NULL,
    "aaguid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_passkey_provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_passkey_credentialId_key" ON "user_passkey"("credentialId");

-- CreateIndex
CREATE INDEX "user_passkey_userId_idx" ON "user_passkey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_passkey_provider_aaguid_key" ON "user_passkey_provider"("aaguid");

-- AddForeignKey
ALTER TABLE "user_passkey" ADD CONSTRAINT "user_passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passkey" ADD CONSTRAINT "user_passkey_passkeyProviderId_fkey" FOREIGN KEY ("passkeyProviderId") REFERENCES "user_passkey_provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
