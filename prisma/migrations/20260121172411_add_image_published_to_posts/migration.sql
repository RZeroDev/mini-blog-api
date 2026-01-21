-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "image" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
