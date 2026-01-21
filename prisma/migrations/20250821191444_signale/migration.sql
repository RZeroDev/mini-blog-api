/*
  Warnings:

  - You are about to drop the column `motif` on the `Signal` table. All the data in the column will be lost.
  - Added the required column `date` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heure` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place` to the `Signal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Signal" DROP COLUMN "motif",
ADD COLUMN     "assetImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "heure" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "place" TEXT NOT NULL,
ADD COLUMN     "placeImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
