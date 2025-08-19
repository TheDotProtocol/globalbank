-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "disputeCreatedAt" TIMESTAMP(3),
ADD COLUMN     "disputeReason" TEXT,
ADD COLUMN     "disputeResolution" TEXT,
ADD COLUMN     "disputeResolvedAt" TIMESTAMP(3),
ADD COLUMN     "disputeStatus" "DisputeStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "isDisputed" BOOLEAN NOT NULL DEFAULT false;
