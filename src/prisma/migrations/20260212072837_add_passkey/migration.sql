-- CreateTable
CREATE TABLE "user-passkey" (
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

    CONSTRAINT "user-passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasskeyProvider" (
    "id" SERIAL NOT NULL,
    "aaguid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PasskeyProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user-passkey_credentialId_key" ON "user-passkey"("credentialId");

-- CreateIndex
CREATE INDEX "user-passkey_userId_idx" ON "user-passkey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasskeyProvider_aaguid_key" ON "PasskeyProvider"("aaguid");

-- AddForeignKey
ALTER TABLE "user-passkey" ADD CONSTRAINT "user-passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user-passkey" ADD CONSTRAINT "user-passkey_passkeyProviderId_fkey" FOREIGN KEY ("passkeyProviderId") REFERENCES "PasskeyProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
