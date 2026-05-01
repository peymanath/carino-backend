-- CreateTable
CREATE TABLE "BomberJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BomberJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BomberJob_jobId_key" ON "BomberJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "BomberJob_mobile_key" ON "BomberJob"("mobile");
