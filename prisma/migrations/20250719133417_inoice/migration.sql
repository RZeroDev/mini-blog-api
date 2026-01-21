/*
  Warnings:

  - You are about to drop the column `invoice` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "invoice",
ADD COLUMN     "invoices" TEXT[];
