/*
  Warnings:

  - You are about to drop the column `device` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,browserName,osName,deviceType]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `browserEngine` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `browserName` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceType` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `osName` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_userId_device_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "device",
ADD COLUMN     "browserEngine" INTEGER NOT NULL,
ADD COLUMN     "browserMajor" INTEGER,
ADD COLUMN     "browserName" INTEGER NOT NULL,
ADD COLUMN     "deviceType" INTEGER NOT NULL,
ADD COLUMN     "osName" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_browserName_osName_deviceType_key" ON "Session"("userId", "browserName", "osName", "deviceType");
