-- CreateEnum
CREATE TYPE "TransferMode" AS ENUM ('INTERNAL_TRANSFER', 'EXTERNAL_TRANSFER', 'WIRE_TRANSFER', 'ACH_TRANSFER', 'CARD_TRANSFER', 'MOBILE_TRANSFER', 'INTERNATIONAL_TRANSFER');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "transferMode" "TransferMode",
ADD COLUMN "sourceAccountId" TEXT,
ADD COLUMN "destinationAccountId" TEXT,
ADD COLUMN "sourceAccountNumber" TEXT,
ADD COLUMN "destinationAccountNumber" TEXT,
ADD COLUMN "sourceAccountHolder" TEXT,
ADD COLUMN "destinationAccountHolder" TEXT,
ADD COLUMN "transferFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "netAmount" DECIMAL(65,30); 