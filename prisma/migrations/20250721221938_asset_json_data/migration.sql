/*
  Warnings:

  - You are about to drop the column `description` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `data` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Asset_serialNumber_key";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "serialNumber",
ADD COLUMN     "data" JSONB NOT NULL;
