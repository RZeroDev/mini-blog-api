-- CreateTable
CREATE TABLE "Alerte" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "circonstance" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,
    "heure" TIMESTAMP(3) NOT NULL,
    "place" TEXT NOT NULL,
    "plaintNumber" TEXT,

    CONSTRAINT "Alerte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
